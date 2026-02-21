import { GoogleGenAI, Modality } from "@google/genai";
import { Meditation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const meditations: Meditation[] = [
  {
    id: 'm1',
    title: 'Deep Ocean Relaxation',
    description: 'A calming journey to the depths of the ocean to release tension and find peace.',
    duration: '5 min',
    category: 'relaxation',
    image: 'https://picsum.photos/seed/ocean/800/600',
    script: [
      "Find a comfortable position and gently close your eyes.",
      "Take a deep breath in, and as you exhale, imagine you are floating on the surface of a calm, blue ocean.",
      "Feel the gentle warmth of the sun on your skin and the soft rhythm of the waves beneath you.",
      "Now, slowly begin to sink beneath the surface, into the quiet, cool depths.",
      "The water is clear and peaceful. All the noise from the world above fades away.",
      "With every breath, you sink deeper into relaxation. Your body feels light and weightless.",
      "Observe the gentle sway of the seaweed and the soft light filtering down from above.",
      "You are safe. You are at peace. Stay here for a moment, simply breathing.",
      "When you are ready, slowly bring your awareness back to the room and open your eyes."
    ]
  },
  {
    id: 'm2',
    title: 'Focused Mountain Peak',
    description: 'Sharpen your mind and find clarity by visualizing a steady mountain peak.',
    duration: '3 min',
    category: 'focus',
    image: 'https://picsum.photos/seed/mountain/800/600',
    script: [
      "Sit upright, feeling the ground beneath you, strong and steady.",
      "Imagine you are a mountain. Your base is rooted deep in the earth, and your peak reaches high into the clear sky.",
      "Clouds may pass by, representing your thoughts. Observe them, but do not hold onto them.",
      "Your focus is as sharp and clear as the mountain air.",
      "Breathe in clarity. Breathe out distraction.",
      "You are unshakeable. You are present. You are focused.",
      "Hold this feeling of strength and clarity for a few more breaths.",
      "Now, slowly return your focus to your surroundings, carrying this mountain-like stability with you."
    ]
  },
  {
    id: 'm3',
    title: 'Starlight Sleep Drift',
    description: 'A soothing visualization of the night sky to help you drift into a restful sleep.',
    duration: '7 min',
    category: 'sleep',
    image: 'https://picsum.photos/seed/stars/800/600',
    script: [
      "Lying down comfortably, let your body sink into the softness of your bed.",
      "Imagine the ceiling above you opening up to a vast, dark night sky filled with twinkling stars.",
      "Each star is a point of calm. Pick one star and focus on its gentle light.",
      "As you breathe, imagine the starlight washing over you like a soft, warm blanket.",
      "Your feet feel heavy and relaxed. Your legs, your torso, your arms... all sinking deeper.",
      "The universe is quiet. The night is still.",
      "Let your thoughts drift away like shooting stars, disappearing into the darkness.",
      "You are drifting... drifting... into a deep, restorative sleep.",
      "Rest now. The stars are watching over you."
    ]
  }
];

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this meditation script with a very calm, soothing, and slow voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, // Charon is often good for deep/calm
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
}
