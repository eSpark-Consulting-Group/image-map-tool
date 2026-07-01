"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Area = {
  shape: "rect" | "circle";
  coords: number[];
  alt: string;
  href: string;
};

export default function ImageMapEditor() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (!drawing || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (!startCoords) {
      // start drawing rectangle
      setStartCoords([x, y]);
    } else {
      // finish drawing rectangle
      const newArea: Area = {
        shape: "rect",
        coords: [startCoords[0], startCoords[1], x, y],
        alt: "New Area",
        href: "#",
      };
      setAreas([...areas, newArea]);
      setStartCoords(null);
      setDrawing(false);
    }
  };

  const exportHTML = () => {
    let mapHTML = `<img src="${imageUrl || "image.jpg"}" alt="Workplace" usemap="#workmap">\n\n`;
    mapHTML += `<map name="workmap">\n`;
    areas.forEach((area) => {
      mapHTML += `  <area shape="${area.shape}" coords="${area.coords.join(
        ","
      )}" alt="${area.alt}" href="${area.href}">\n`;
    });
    mapHTML += `</map>`;
    return mapHTML;
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">🖼️ Image Map Editor</h2>

      <input type="file" accept="image/*" onChange={handleFileUpload} />

      {imageUrl && (
        <div className="relative border rounded-lg shadow-md inline-block">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Editable"
            onClick={handleImageClick}
            className="max-w-full cursor-crosshair"
          />
          {/* Preview drawn areas */}
          {areas.map((area, i) =>
            area.shape === "rect" ? (
              <div
                key={i}
                className="absolute border-2 border-red-500 bg-red-500/20"
                style={{
                  left: Math.min(area.coords[0], area.coords[2]),
                  top: Math.min(area.coords[1], area.coords[3]),
                  width: Math.abs(area.coords[2] - area.coords[0]),
                  height: Math.abs(area.coords[3] - area.coords[1]),
                }}
              />
            ) : null
          )}
        </div>
      )}

      <div className="space-x-2">
        <Button onClick={() => setDrawing(true)}>➕ Add Rectangle</Button>
        <Button variant="secondary" onClick={() => navigator.clipboard.writeText(exportHTML())}>
          📋 Copy HTML
        </Button>
      </div>

      {/* Exported Code */}
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
        {exportHTML()}
      </pre>
    </div>
  );
}
