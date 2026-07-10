// ================= AI SYMPTOM CHECKER =================
// A lightweight rule-based symptom -> condition mapper.
// NOTE: This is NOT a medical diagnostic tool. It only gives a
// preliminary suggestion so the patient is routed to the right
// department faster. A real diagnosis always comes from a doctor.

const KNOWLEDGE_BASE = [
    {
        symptoms: ["fever", "cough", "cold", "sore throat", "runny nose"],
        disease: "Viral Fever / Common Cold",
        precautions: [
            "Stay hydrated and take plenty of rest",
            "Take paracetamol only as advised by a pharmacist/doctor",
            "Avoid cold drinks and exposure to cold air",
        ],
        department: "General Medicine",
    },
    {
        symptoms: ["fever", "headache", "vomiting", "body pain", "chills"],
        disease: "Possible Malaria / Dengue (Viral Infection)",
        precautions: [
            "Get a blood test (CBC/Malaria/Dengue panel) done urgently",
            "Stay hydrated, avoid mosquito exposure",
            "Seek medical attention if fever persists over 2 days",
        ],
        department: "General Medicine",
    },
    {
        symptoms: ["chest pain", "breathlessness", "sweating", "left arm pain"],
        disease: "Possible Cardiac Issue",
        precautions: [
            "Seek EMERGENCY medical attention immediately",
            "Avoid physical exertion",
            "Do not drive yourself, call for help",
        ],
        department: "Cardiology",
    },
    {
        symptoms: ["headache", "dizziness", "blurred vision", "nausea"],
        disease: "Possible Migraine / Hypertension",
        precautions: [
            "Rest in a quiet, dark room",
            "Monitor blood pressure if possible",
            "Avoid bright screens and loud noise",
        ],
        department: "Neurology",
    },
    {
        symptoms: ["joint pain", "back pain", "swelling", "stiffness"],
        disease: "Possible Musculoskeletal Strain / Arthritis",
        precautions: [
            "Apply warm/cold compress as comfortable",
            "Avoid heavy lifting or strenuous activity",
            "Gentle stretching may help; avoid self-medicating",
        ],
        department: "Orthopedics",
    },
    {
        symptoms: ["rash", "itching", "skin", "redness"],
        disease: "Possible Skin Allergy / Infection",
        precautions: [
            "Avoid scratching the affected area",
            "Avoid known allergens (soaps, foods, fabrics)",
            "Keep the area clean and dry",
        ],
        department: "Dermatology",
    },
    {
        symptoms: ["abdominal pain", "vomiting", "diarrhea", "stomach ache", "nausea"],
        disease: "Possible Gastroenteritis / Food Poisoning",
        precautions: [
            "Stay hydrated with ORS/fluids",
            "Avoid oily and spicy food",
            "Seek care if symptoms persist beyond 24-48 hours",
        ],
        department: "General Medicine",
    },
];

const normalize = (s) => s.toLowerCase().trim();

const checkSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one symptom",
            });
        }

        const inputSymptoms = symptoms.map(normalize);

        // Score every condition by how many symptoms overlap
        const scored = KNOWLEDGE_BASE.map((entry) => {
            const matchCount = entry.symptoms.filter((sym) =>
                inputSymptoms.some(
                    (input) => input.includes(sym) || sym.includes(input)
                )
            ).length;

            return { ...entry, matchCount };
        }).filter((entry) => entry.matchCount > 0);

        scored.sort((a, b) => b.matchCount - a.matchCount);

        const results = scored.slice(0, 3);

        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                matched: false,
                message:
                    "No specific match found. We recommend a General Medicine consultation.",
                suggestions: [
                    {
                        disease: "General Consultation Recommended",
                        precautions: [
                            "Monitor your symptoms",
                            "Stay hydrated and rested",
                            "Consult a doctor if symptoms worsen",
                        ],
                        department: "General Medicine",
                    },
                ],
            });
        }

        res.status(200).json({
            success: true,
            matched: true,
            suggestions: results.map(({ disease, precautions, department }) => ({
                disease,
                precautions,
                department,
            })),
            recommendedDepartment: results[0].department,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = { checkSymptoms };
