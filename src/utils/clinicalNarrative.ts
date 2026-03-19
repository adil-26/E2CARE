
/**
 * Utility to convert raw medical history data into professional clinical sentences.
 */

export function generateClinicalNarrative(history: any): string[] {
  if (!history) return [];
  const sentences: string[] = [];

  // --- 1. Medical Conditions ---
  const conditions = history.medical_conditions?.conditions || [];
  const activeConditions = conditions.filter(
    (c: any) => c.status?.toLowerCase() === "active" || c.status?.toLowerCase() === "chronic"
  );
  
  if (activeConditions.length > 0) {
    const names = activeConditions.map((c: any) => `${c.name} (${c.severity || 'moderate'})`).join(", ");
    sentences.push(`Patient presents with ${activeConditions.length} active or chronic medical conditions, including: ${names}.`);
  }

  // --- 2. Allergies ---
  const drugAllergies = history.allergies?.drug_allergies || [];
  if (drugAllergies.length > 0) {
    sentences.push(`Clinically significant drug allergies identified to: ${drugAllergies.join(", ")}. Standard precautions for medication administration are required.`);
  }

  // --- 3. Surgeries & Procedures ---
  const surgeries = history.surgeries?.surgeries || [];
  if (surgeries.length > 0) {
    const surgeryList = surgeries.map((s: any) => s.procedure || s.name).join(", ");
    sentences.push(`Comprehensive surgical history includes ${surgeries.length} recorded procedures, most notably: ${surgeryList}.`);
  }

  // --- 4. Clinical Findings (ENT/Oral) ---
  const ent = history.body_systems?.ent || {};
  const tongueConds = ent.tongue_conditions || [];
  const gumConds = ent.gum_conditions || [];
  
  if (tongueConds.length > 0 || gumConds.length > 0) {
    const oralDetails = [...tongueConds, ...gumConds].join(", ");
    sentences.push(`Oral system review identifies significant findings: ${oralDetails}. See ENT section for anatomical mapping.`);
  }

  // --- 5. Family & Childhood History ---
  const family = history.family_history?.conditions || [];
  if (family.length > 0) {
    sentences.push(`Positive family history noted for ${family.join(", ")}, suggesting potential genetic predisposition.`);
  }

  const childhood = history.childhood_illnesses?.illnesses || [];
  if (childhood.length > 0) {
    sentences.push(`Patient reports a history of ${childhood.join(", ")} during developmental years.`);
  }

  // --- 6. Lifestyle & Metabolic Indicators ---
  const lifestyle = history.lifestyle || {};
  if (lifestyle.smoking_status === "current") {
    sentences.push(`Current smoking status reported (${lifestyle.cigarettes_per_day || 'unspecified'} cigarettes/day). Smoking cessation protocols recommended.`);
  }
  if (lifestyle.alcohol_consumption && lifestyle.alcohol_consumption !== "never") {
    sentences.push(`Alcohol consumption is noted as ${lifestyle.alcohol_consumption.replace('_', ' ')}. Cross-check for potential hepatic findings.`);
  }
  if (lifestyle.exercise_frequency === "never" || lifestyle.exercise_frequency === "rarely") {
    sentences.push(`Sedentary lifestyle reported; metabolic and cardiovascular optimization through increased physical activity may be beneficial.`);
  }

  // --- 7. GI & Metabolic Findings ---
  const gi = history.body_systems?.gi || {};
  if (gi.appetite && gi.appetite !== "normal") {
    sentences.push(`Patient reports ${gi.appetite} appetite, which may correlate with underlying metabolic or digestive imbalances.`);
  }
  if (gi.bloating && gi.bloating !== "never") {
    sentences.push(`Clinical findings include ${gi.bloating.replace('_', ' ')} bloating, suggestive of potential gut dysbiosis or food intolerances.`);
  }
  if (gi.organ_removed && gi.organ_removed !== "none") {
    sentences.push(`Anatomical history significant for removal of ${gi.organ_removed} (Ref: ${gi.organ_removed_year || 'Year not specified'}).`);
  }

  return sentences;
}
