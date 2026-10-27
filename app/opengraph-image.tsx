import { ImageResponse } from "next/og";

export const alt = "CreatorLab AI — plan, create, test, and improve content with AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#F4F7FF", color: "#0F1E4A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="64" height="64" viewBox="0 0 64 64"><path d="M13 44 L26 31 L34 38 L47 21" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><path d="M47 8 L50 16 L58 19 L50 22 L47 30 L44 22 L36 19 L44 16 Z" fill="#F5C451" /></svg></div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>Creator<span style={{ color: "#1D4ED8" }}>Lab</span><span style={{ marginLeft: 16, background: "#0F1E4A", color: "#fff", fontSize: 36, padding: "6px 16px", borderRadius: 10, alignSelf: "center" }}>AI</span></div>
        </div>
        <div style={{ marginTop: 48, fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 950 }}>Plan, create, test, and improve content — with AI as your assistant.</div>
        <div style={{ marginTop: 32, fontSize: 28, color: "#5b6676" }}>Demo-first learning platform for students and trainers</div>
      </div>
    ),
    size,
  );
}
