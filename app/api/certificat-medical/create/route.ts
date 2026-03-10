import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json(
        { error: 'Only doctors can create medical certificates' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      patientName,
      patientDob,
      certificateDate,
      reason,
      duration,
      observations,
    } = body;

    if (!patientName || !certificateDate || !reason) {
      return NextResponse.json(
        { error: 'Patient name, certificate date and reason are required' },
        { status: 400 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const black = rgb(0, 0, 0);
    const gray = rgb(0.4, 0.4, 0.4);

    let y = 800;
    const lineHeight = 18;
    const margin = 50;

    const drawLine = (text: string, opts: { size?: number; bold?: boolean } = {}) => {
      const size = opts.size ?? 11;
      const f = opts.bold ? fontBold : font;
      page.drawText(text.slice(0, 90), {
        x: margin,
        y,
        size,
        font: f,
        color: black,
      });
      y -= lineHeight;
    };

    page.drawText('CERTIFICAT MÉDICAL', {
      x: margin,
      y,
      size: 18,
      font: fontBold,
      color: black,
    });
    y -= lineHeight * 1.5;

    drawLine(`Dr. ${(user.full_name as string) || 'Médecin'}`, { bold: true });
    y -= 8;

    drawLine(`Je soussigné(e), Dr. ${(user.full_name as string) || 'Médecin'}, certifie avoir examiné :`);
    drawLine(`Nom du patient : ${String(patientName).trim()}`, { bold: true });
    if (patientDob) {
      drawLine(`Date de naissance : ${String(patientDob).trim()}`);
    }
    drawLine(`Date du certificat : ${String(certificateDate).trim()}`);
    y -= 4;

    drawLine('Motif / Objet du certificat :', { bold: true });
    const reasonLines = String(reason).trim().split(/\r?\n/);
    for (const line of reasonLines) {
      if (line.length > 80) {
        for (let i = 0; i < line.length; i += 80) {
          drawLine(line.slice(i, i + 80));
        }
      } else {
        drawLine(line);
      }
    }
    if (duration) {
      y -= 4;
      drawLine(`Durée / Période : ${String(duration).trim()}`);
    }
    if (observations && String(observations).trim()) {
      y -= 4;
      drawLine('Observations :', { bold: true });
      const obsLines = String(observations).trim().split(/\r?\n/);
      for (const line of obsLines) {
        if (line.length > 80) {
          for (let i = 0; i < line.length; i += 80) {
            drawLine(line.slice(i, i + 80));
          }
        } else {
          drawLine(line);
        }
      }
    }

    y -= 24;
    page.drawText('Signature et cachet du médecin', {
      x: margin,
      y,
      size: 10,
      font,
      color: gray,
    });

    const pdfBytes = await pdfDoc.save();

    const dir = join(process.cwd(), 'public', 'certificats-medicaux');
    await mkdir(dir, { recursive: true });
    const timestamp = Date.now();
    const fileName = `certificat_medical_${timestamp}.pdf`;
    const filePath = join(dir, fileName);
    await writeFile(filePath, Buffer.from(pdfBytes));

    const publicFilePath = `/certificats-medicaux/${fileName}`;

    return NextResponse.json(
      { filePath: publicFilePath, fileName },
      { status: 201 }
    );
  } catch (err) {
    console.error('Certificat medical create error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
