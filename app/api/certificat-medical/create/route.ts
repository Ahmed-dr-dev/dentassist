import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const TEAL       = rgb(0.051, 0.580, 0.533);   // teal-600
const TEAL_LIGHT = rgb(0.878, 0.969, 0.961);   // teal-50
const DARK       = rgb(0.12,  0.12,  0.12);
const MID        = rgb(0.35,  0.35,  0.35);
const SUBTLE     = rgb(0.55,  0.55,  0.55);
const WHITE      = rgb(1,     1,     1);
const BORDER     = rgb(0.82,  0.88,  0.87);

function wrapText(text: string, maxChars = 82): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'doctor') {
      return NextResponse.json({ error: 'Only doctors can create medical certificates' }, { status: 403 });
    }

    const body = await request.json();
    const { patientName, patientDob, certificateDate, reason, duration, observations } = body;

    if (!patientName || !certificateDate || !reason) {
      return NextResponse.json({ error: 'Patient name, certificate date and reason are required' }, { status: 400 });
    }

    const doctorName: string = (user.full_name as string) || 'Médecin';
    const certDate: string   = String(certificateDate).trim();
    const certDateFr = new Date(certDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    // ── Page setup ──────────────────────────────────────────────────────────
    const pdfDoc  = await PDFDocument.create();
    const page    = pdfDoc.addPage([595, 842]); // A4
    const font    = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontObl = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const W = 595;

    // ── Outer border ────────────────────────────────────────────────────────
    page.drawRectangle({ x: 18, y: 18, width: W - 36, height: 842 - 36, borderColor: BORDER, borderWidth: 1.5 });

    // ── Header bar ──────────────────────────────────────────────────────────
    page.drawRectangle({ x: 18, y: 742, width: W - 36, height: 82, color: TEAL });

    // Header title
    page.drawText('CERTIFICAT MÉDICAL', {
      x: 42, y: 784, size: 22, font: fontB, color: WHITE,
    });
    page.drawText('Cabinet Dentaire DentAssist', {
      x: 42, y: 763, size: 10, font: fontObl, color: rgb(0.78, 0.95, 0.93),
    });

    // Top-right: logo placeholder (circle)
    page.drawCircle({ x: 546, y: 783, size: 22, color: rgb(1, 1, 1, 0.15 as any) });
    page.drawText('D', { x: 539, y: 777, size: 18, font: fontB, color: WHITE });

    // ── Doctor info row ──────────────────────────────────────────────────────
    page.drawRectangle({ x: 18, y: 702, width: W - 36, height: 38, color: rgb(0.97, 0.97, 0.97) });
    page.drawText(`Dr. ${doctorName}`, { x: 42, y: 726, size: 11, font: fontB, color: DARK });
    page.drawText('Médecin Dentiste  •  Gafsa, Tunisie  •  +216 12 345 678', {
      x: 42, y: 712, size: 9, font, color: MID,
    });

    // Teal accent line below doctor row
    page.drawRectangle({ x: 18, y: 700, width: W - 36, height: 2, color: TEAL });

    // ── Certificate number + date ────────────────────────────────────────────
    const certNo = `N° CERT-${Date.now().toString().slice(-8)}`;
    page.drawText(certNo,         { x: 42, y: 682, size: 9, font, color: SUBTLE });
    page.drawText(`Date : ${certDateFr}`, { x: 42, y: 669, size: 9, font, color: SUBTLE });

    // ── Patient info box ─────────────────────────────────────────────────────
    page.drawRectangle({ x: 42, y: 590, width: W - 84, height: 66, color: TEAL_LIGHT, borderColor: BORDER, borderWidth: 1 });
    page.drawRectangle({ x: 42, y: 652, width: 4, height: 66, color: TEAL });

    page.drawText('INFORMATIONS DU PATIENT', { x: 54, y: 641, size: 8, font: fontB, color: TEAL });
    page.drawText(`Nom & Prénom :`, { x: 54, y: 626, size: 10, font, color: MID });
    page.drawText(String(patientName).trim(), { x: 160, y: 626, size: 10, font: fontB, color: DARK });

    if (patientDob) {
      const dobFr = new Date(String(patientDob)).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      page.drawText(`Date de naissance :`, { x: 54, y: 610, size: 10, font, color: MID });
      page.drawText(dobFr, { x: 160, y: 610, size: 10, font, color: DARK });
    }

    page.drawText(`Date du certificat :`, { x: 54, y: patientDob ? 596 : 610, size: 10, font, color: MID });
    page.drawText(certDateFr, { x: 160, y: patientDob ? 596 : 610, size: 10, font: fontB, color: DARK });

    // ── Attestation sentence ─────────────────────────────────────────────────
    let y = 570;
    page.drawText(
      `Je soussigné(e), Dr. ${doctorName}, Médecin Dentiste, certifie avoir examiné le patient`,
      { x: 42, y, size: 10, font, color: DARK }
    );
    y -= 14;
    page.drawText(`désigné(e) ci-dessus et établi le présent certificat médical.`, {
      x: 42, y, size: 10, font, color: DARK,
    });
    y -= 24;

    // ── Reason section ───────────────────────────────────────────────────────
    page.drawText('MOTIF / OBJET DU CERTIFICAT', { x: 42, y, size: 8, font: fontB, color: TEAL });
    y -= 4;
    page.drawRectangle({ x: 42, y: y - 4, width: W - 84, height: 1, color: TEAL });
    y -= 14;

    const reasonLines = wrapText(String(reason).trim());
    for (const line of reasonLines) {
      page.drawText(line, { x: 42, y, size: 10, font, color: DARK });
      y -= 14;
    }

    // ── Duration ─────────────────────────────────────────────────────────────
    if (duration && String(duration).trim()) {
      y -= 8;
      page.drawText('DURÉE / PÉRIODE :', { x: 42, y, size: 8, font: fontB, color: TEAL });
      y -= 14;
      page.drawText(String(duration).trim(), { x: 42, y, size: 10, font, color: DARK });
      y -= 14;
    }

    // ── Observations ──────────────────────────────────────────────────────────
    if (observations && String(observations).trim()) {
      y -= 8;
      page.drawText('OBSERVATIONS', { x: 42, y, size: 8, font: fontB, color: TEAL });
      y -= 4;
      page.drawRectangle({ x: 42, y: y - 4, width: W - 84, height: 1, color: TEAL });
      y -= 14;
      const obsLines = wrapText(String(observations).trim());
      for (const line of obsLines) {
        page.drawText(line, { x: 42, y, size: 10, font, color: DARK });
        y -= 14;
      }
    }

    // ── Closing sentence ──────────────────────────────────────────────────────
    y -= 16;
    page.drawText(
      `En foi de quoi, le présent certificat est délivré à l'intéressé(e) pour servir et valoir`,
      { x: 42, y, size: 10, font: fontObl, color: MID }
    );
    y -= 14;
    page.drawText(`ce que de droit.`, { x: 42, y, size: 10, font: fontObl, color: MID });

    // ── Signature block ───────────────────────────────────────────────────────
    const sigY = 120;
    page.drawText(`Fait à Gafsa, le ${certDateFr}`, { x: 42, y: sigY + 48, size: 10, font, color: DARK });

    // Signature box (right side)
    page.drawRectangle({ x: 370, y: sigY, width: 170, height: 80, borderColor: BORDER, borderWidth: 1 });
    page.drawText('Signature & Cachet du Médecin', { x: 383, y: sigY + 66, size: 8, font: fontB, color: MID });
    page.drawText(`Dr. ${doctorName}`, { x: 383, y: sigY + 52, size: 9, font, color: DARK });
    // Dotted line for signature
    page.drawLine({ start: { x: 383, y: sigY + 20 }, end: { x: 526, y: sigY + 20 }, thickness: 0.5, color: BORDER, dashArray: [3, 3] });

    // ── Footer bar ────────────────────────────────────────────────────────────
    page.drawRectangle({ x: 18, y: 18, width: W - 36, height: 32, color: TEAL });
    page.drawText('Cabinet Dentaire DentAssist  •  123 Rue Principale, Gafsa  •  +216 12 345 678  •  contact@dentassist.com', {
      x: 42, y: 30, size: 8, font, color: WHITE,
    });

    // ── Save ──────────────────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const dir = join(process.cwd(), 'public', 'certificats-medicaux');
    await mkdir(dir, { recursive: true });
    const timestamp = Date.now();
    const fileName = `certificat_medical_${timestamp}.pdf`;
    await writeFile(join(dir, fileName), Buffer.from(pdfBytes));
    const publicFilePath = `/certificats-medicaux/${fileName}`;

    await supabase.from('medical_certificates').insert({
      doctor_id: user.id,
      patient_name: String(patientName).trim(),
      file_path: publicFilePath,
    });

    return NextResponse.json({ filePath: publicFilePath, fileName }, { status: 201 });
  } catch (err) {
    console.error('Certificat medical create error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
