import React, { useRef, useState, useMemo } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { Box as BoxIcon } from "lucide-react";

// --- Types & Interfaces ---
interface ProceduralSkeletonProps {
    highlightedBones?: string[];
    onToggle?: (boneName: string) => void;
}

interface BoneProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    color?: string;
    name: string;
    onClick?: (name: string) => void;
    highlighted?: boolean;
}

// --- Helper: Material Generator ---
const useBoneMaterial = (highlighted: boolean = false) => {
    return useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: highlighted ? "#ef4444" : "#e2e8f0",
                roughness: 0.5,
                metalness: 0.1,
            }),
        [highlighted]
    );
};

// --- Part 1: SKULL (Cranial & Facial) ---
// Measurements converted to meters (e.g., 140mm -> 0.14m)
const Skull = ({ highlightedBones, onToggle }: { highlightedBones: string[]; onToggle?: (n: string) => void }) => {
    // Cranial Group Position: Top of spine (approx 1.7m high)
    const headY = 1.70;

    return (
        <group position={[0, headY, 0]}>
            {/* 1. Frontal Bone (Forehead) - Curved Plate */}
            <mesh
                position={[0, 0.06, 0.05]}
                rotation={[-0.2, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Frontal Bone"); }}
            >
                <sphereGeometry args={[0.06, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Frontal Bone"))} />
            </mesh>

            {/* 2. Parietal Bones (Sides/Roof) - Main Cranial Dome */}
            <mesh
                position={[0, 0.06, -0.02]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Parietal Bones"); }}
            >
                <sphereGeometry args={[0.065, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Parietal Bones"))} />
            </mesh>

            {/* 3. Temporal Bones (Sides/Ears) */}
            <mesh
                position={[0.055, 0.02, -0.01]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Temporal Bone (R)"); }}
            >
                <boxGeometry args={[0.01, 0.04, 0.06]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Temporal Bone (R)"))} />
            </mesh>
            <mesh
                position={[-0.055, 0.02, -0.01]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Temporal Bone (L)"); }}
            >
                <boxGeometry args={[0.01, 0.04, 0.06]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Temporal Bone (L)"))} />
            </mesh>

            {/* 4. Occipital Bone (Back) */}
            <mesh
                position={[0, 0.02, -0.06]}
                rotation={[0.5, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Occipital Bone"); }}
            >
                <sphereGeometry args={[0.06, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.25]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Occipital Bone"))} />
            </mesh>

            {/* 7. Nasal Bones (Bridge) */}
            <mesh
                position={[0, 0.01, 0.07]}
                rotation={[0.2, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Nasal Bones"); }}
            >
                <boxGeometry args={[0.02, 0.025, 0.005]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Nasal Bones"))} />
            </mesh>

            {/* 8. Maxillae (Upper Jaw) */}
            <mesh
                position={[0, -0.02, 0.06]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Maxillae"); }}
            >
                <cylinderGeometry args={[0.025, 0.025, 0.04, 8]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Maxillae"))} />
            </mesh>

            {/* 14. Mandible (Lower Jaw) - U-Shape approximated by 3 boxes */}
            {/* Chin */}
            <mesh position={[0, -0.06, 0.06]} onClick={(e) => { e.stopPropagation(); onToggle?.("Mandible"); }}>
                <boxGeometry args={[0.04, 0.03, 0.01]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Mandible"))} />
            </mesh>
            {/* Jawline R */}
            <mesh position={[0.035, -0.05, 0.04]} rotation={[0, 0.5, 0]} onClick={(e) => { e.stopPropagation(); onToggle?.("Mandible"); }}>
                <boxGeometry args={[0.01, 0.03, 0.06]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Mandible"))} />
            </mesh>
            {/* Jawline L */}
            <mesh position={[-0.035, -0.05, 0.04]} rotation={[0, -0.5, 0]} onClick={(e) => { e.stopPropagation(); onToggle?.("Mandible"); }}>
                <boxGeometry args={[0.01, 0.03, 0.06]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Mandible"))} />
            </mesh>
        </group>
    );
};

// --- Part 2: VERTEBRAL COLUMN ---
const Spine = ({ highlightedBones, onToggle }: { highlightedBones: string[]; onToggle?: (n: string) => void }) => {
    const vertebrae = [];
    let currentY = 1.65; // Start just below skull

    // Helper to create a vertebra
    const addVertebra = (count: number, region: string, height: number, width: number, depth: number) => {
        for (let i = 0; i < count; i++) {
            vertebrae.push({
                id: `${region}${i + 1}`,
                y: currentY,
                h: height,
                w: width,
                d: depth,
                color: highlightedBones.includes(region) ? "#ef4444" : "#e2e8f0"
            });
            // Move down by height + disc space (approx 3mm)
            currentY -= (height + 0.003);
        }
    };

    // A. Cervical (C1-C7)
    // Height ~15mm = 0.015m
    addVertebra(7, "Cervical Vertebrae", 0.015, 0.024, 0.018);

    // B. Thoracic (T1-T12)
    // Height ~22mm = 0.022m
    addVertebra(12, "Thoracic Vertebrae", 0.022, 0.032, 0.025);

    // C. Lumbar (L1-L5)
    // Height ~30mm = 0.030m
    addVertebra(5, "Lumbar Vertebrae", 0.030, 0.048, 0.030);

    // D. Sacrum (Fused) - Wedge shape
    const sacrumY = currentY - 0.055; // Center of sacrum
    // E. Coccyx (Fused) - Tail
    const coccyxY = currentY - 0.11 - 0.02;

    return (
        <group>
            {/* Vertebrae List */}
            {vertebrae.map((v) => (
                <mesh
                    key={v.id}
                    position={[0, v.y, 0]}
                    onClick={(e) => { e.stopPropagation(); onToggle?.(v.id.replace(/[0-9]/g, "") + " Vertebrae"); }} // Group click by region
                >
                    {/* Main Body: Cylinder/Box hybrid */}
                    <cylinderGeometry args={[v.w / 2, v.w / 2, v.h, 16]} />
                    <meshStandardMaterial color={v.color} roughness={0.5} />

                    {/* Spinous Process (Stick sticking out back) */}
                    <mesh position={[0, 0, -v.d / 1.5]} rotation={[0.2, 0, 0]}>
                        <boxGeometry args={[v.w / 3, v.h / 1.5, v.d]} />
                        <meshStandardMaterial color={v.color} roughness={0.5} />
                    </mesh>
                </mesh>
            ))}

            {/* D. Sacrum (Triangle Wedge) */}
            <mesh
                position={[0, sacrumY, 0]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Sacrum"); }}
                rotation={[0, Math.PI / 4, 0]} // Rotate for cylinder/cone orientation if needed, but cone points up by default in Y
            >
                {/* Cone geometry: RadiusTop, RadiusBottom, Height */}
                {/* Inverted cone for wedge shape approx */}
                <cylinderGeometry args={[0.06, 0.03, 0.11, 4]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Sacrum"))} />
            </mesh>

            {/* E. Coccyx (Tailbone) */}
            <mesh
                position={[0, coccyxY, 0.01]} // Slightly forward curve
                rotation={[0.2, 0, 0]}
                onClick={(e) => { e.stopPropagation(); onToggle?.("Coccyx"); }}
            >
                <coneGeometry args={[0.015, 0.035, 8]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Coccyx"))} />
            </mesh>
        </group>
    );

};

// --- Part 3: THORACIC CAGE ---
const ThoracicCage = ({ highlightedBones, onToggle }: { highlightedBones: string[]; onToggle?: (n: string) => void }) => {
    // Sternum (Breastbone)
    // 170mm long = 0.17m
    // Position: Front of chest. Spine T nodes are at Z=0. Sternum at Z ~ 0.15 (chest depth).
    const sternumY = 1.45; // Approx center of chest
    const sternumZ = 0.12;

    const ribs = [];
    // 12 Pairs
    for (let i = 0; i < 12; i++) {
        // T1 starts at 1.628 (Spine calculation: 1.65 - 0.022 = 1.628)
        // We'll mimic T-spine positions roughly
        const ribY = 1.63 - (i * 0.025);

        // Radius of rib arc (widest in middle 5-8)
        // 70mm top -> 120mm bottom? No, middle is widest.
        // Let's go 0.08 -> 0.12 -> 0.10
        let radius = 0.08 + Math.sin((i / 11) * Math.PI) * 0.05;

        // Arc length: True ribs differ from floating
        // 1-7 (True): Reach sternum (almost full circle or deep C)
        // 8-10 (False): Reach cartilage (shorter bone arc)
        // 11-12 (Floating): Short
        let arc = Math.PI * 0.8;
        if (i >= 7) arc = Math.PI * 0.7;
        if (i >= 10) arc = Math.PI * 0.4;

        // Angle tilt (Ribs slope down)
        const tilt = 0.2 + (i * 0.02);

        ribs.push({ id: i + 1, y: ribY, r: radius, arc, tilt });
    }

    return (
        <group>
            {/* Sternum */}
            <mesh
                position={[0, sternumY, sternumZ]}
                rotation={[0.1, 0, 0]} // Slight tilt
                onClick={(e) => { e.stopPropagation(); onToggle?.("Sternum"); }}
            >
                <boxGeometry args={[0.04, 0.17, 0.015]} />
                <primitive object={useBoneMaterial(highlightedBones.includes("Sternum"))} />
            </mesh>

            {/* Ribs */}
            {ribs.map((rib) => (
                <group key={rib.id} position={[0, rib.y, 0]}>
                    {/* Left Rib */}
                    <mesh
                        rotation={[rib.tilt, Math.PI + 0.2, 0]} // Rotate to come from back to front
                        position={[-0.01, 0, 0]} // Offset from spine center
                        onClick={(e) => { e.stopPropagation(); onToggle?.(`Rib ${rib.id} (L)`); }}
                    >
                        {/* Torus: radius, tube, radialSegments, tubularSegments, arc */}
                        <torusGeometry args={[rib.r, 0.006, 8, 24, rib.arc]} />
                        <primitive object={useBoneMaterial(highlightedBones.includes(`Rib ${rib.id} (L)`))} />
                    </mesh>

                    {/* Right Rib */}
                    <mesh
                        rotation={[rib.tilt + Math.PI, 0.2, Math.PI]} // Flip logic is hard, let's just use Scale -1?
                        onClick={(e) => { e.stopPropagation(); onToggle?.(`Rib ${rib.id} (R)`); }}
                        scale={[1, 1, -1]} // Mirror Z?
                    >
                        {/* Re-using geometry but mirroring Z might invert normals. Let's try explicit rotation instead usually. */}
                        {/* Actually, let's just position geometry specifically. */}
                        <torusGeometry args={[rib.r, 0.006, 8, 24, rib.arc]} />
                        <primitive object={useBoneMaterial(highlightedBones.includes(`Rib ${rib.id} (R)`))} />
                    </mesh>
                </group>
            ))}
        </group>
    );

};

// --- Part 4: UPPER LIMBS ---
const UpperLimbs = ({ highlightedBones, onToggle }: { highlightedBones: string[]; onToggle?: (n: string) => void }) => {
    // Shoulder Girdle
    const clavicleY = 1.55;
    const shoulderX = 0.18; // Width from center to shoulder joint

    const Arm = ({ side }: { side: "L" | "R" }) => {
        const s = side === "R" ? 1 : -1;
        const nameSuffix = `(${side})`;

        return (
            <group>
                {/* Clavicle (Collarbone) - S-shape */}
                <mesh
                    position={[s * 0.09, clavicleY, 0.1]}
                    rotation={[0, 0, s * -0.1]}
                    onClick={(e) => { e.stopPropagation(); onToggle?.(`Clavicle ${nameSuffix}`); }}
                >
                    <cylinderGeometry args={[0.01, 0.012, 0.15, 8]} />
                    <meshStandardMaterial color={highlightedBones.includes(`Clavicle ${nameSuffix}`) ? "#ef4444" : "#e2e8f0"} />
                    {/* Rotate geometry to lie horizontal */}
                    <primitive object={new THREE.Mesh().geometry} />
                    {/* Wait, primitive logic is for shared mats. For easy rotation, just rotate mesh. Default cylinder is Y-up. */}
                    {/* We need X-aligned cylinder for clavicle. Rotate Z by 90deg. */}
                </mesh>
                {/* Re-do Clavicle with correct rotation */}
                <mesh
                    position={[s * 0.09, clavicleY, 0.08]}
                    rotation={[0, 0, Math.PI / 2]} // Lay flat
                    onClick={(e) => { e.stopPropagation(); onToggle?.(`Clavicle ${nameSuffix}`); }}
                >
                    <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
                    <primitive object={useBoneMaterial(highlightedBones.includes(`Clavicle ${nameSuffix}`))} />
                </mesh>

                {/* Scapula (Shoulder Blade) - Triangle on back */}
                <mesh
                    position={[s * 0.12, 1.45, -0.06]}
                    rotation={[0.2, 0, s * 0.2]}
                    onClick={(e) => { e.stopPropagation(); onToggle?.(`Scapula ${nameSuffix}`); }}
                >
                    {/* Triangle approx by box or cone? Box with taper? Or simple Box plate */}
                    <boxGeometry args={[0.1, 0.12, 0.01]} />
                    <primitive object={useBoneMaterial(highlightedBones.includes(`Scapula ${nameSuffix}`))} />
                </mesh>

                {/* Humerus (Upper Arm) - 330mm = 0.33m */}
                {/* Joint at Shoulder: X=0.18, Y=1.55 */}
                <group position={[s * 0.20, 1.35, 0.05]}>
                    <mesh
                        position={[0, -0.15, 0]} // Center of bone
                        onClick={(e) => { e.stopPropagation(); onToggle?.(`Humerus ${nameSuffix}`); }}
                    >
                        <cylinderGeometry args={[0.02, 0.02, 0.33, 12]} />
                        <primitive object={useBoneMaterial(highlightedBones.includes(`Humerus ${nameSuffix}`))} />
                    </mesh>

                    {/* Elbow Joint at Y -0.33 (relative to shoulder) */}

                    {/* Forearm: Radius & Ulna */}
                    <group position={[0, -0.33, 0]}>
                        {/* Radius (Thumb side - Outer in anatomical position) */}
                        <mesh
                            position={[s * 0.015, -0.12, 0]}
                            onClick={(e) => { e.stopPropagation(); onToggle?.(`Radius ${nameSuffix}`); }}
                        >
                            <cylinderGeometry args={[0.012, 0.015, 0.24, 8]} />
                            <primitive object={useBoneMaterial(highlightedBones.includes(`Radius ${nameSuffix}`))} />
                        </mesh>

                        {/* Ulna (Pinky side - Inner) */}
                        <mesh
                            position={[s * -0.015, -0.13, 0]}
                            onClick={(e) => { e.stopPropagation(); onToggle?.(`Ulna ${nameSuffix}`); }}
                        >
                            <cylinderGeometry args={[0.012, 0.01, 0.26, 8]} />
                            <primitive object={useBoneMaterial(highlightedBones.includes(`Ulna ${nameSuffix}`))} />
                        </mesh>

                        {/* Hand */}
                        <group position={[0, -0.26, 0]}>
                            {/* Carpals (Wrist) */}
                            <mesh
                                position={[0, -0.02, 0]}
                                onClick={(e) => { e.stopPropagation(); onToggle?.(`Carpals ${nameSuffix}`); }}
                            >
                                <boxGeometry args={[0.05, 0.04, 0.03]} />
                                <primitive object={useBoneMaterial(highlightedBones.includes(`Carpals ${nameSuffix}`))} />
                            </mesh>

                            {/* Metacarpals (Palm) */}
                            <mesh
                                position={[0, -0.07, 0]}
                                onClick={(e) => { e.stopPropagation(); onToggle?.(`Metacarpals ${nameSuffix}`); }}
                            >
                                <boxGeometry args={[0.06, 0.06, 0.015]} />
                                <primitive object={useBoneMaterial(highlightedBones.includes(`Metacarpals ${nameSuffix}`))} />
                            </mesh>

                            {/* Phalanges (Fingers) */}
                            <mesh
                                position={[0, -0.13, 0]}
                                onClick={(e) => { e.stopPropagation(); onToggle?.(`Phalanges ${nameSuffix}`); }}
                            >
                                <boxGeometry args={[0.06, 0.06, 0.01]} />
                                <primitive object={useBoneMaterial(highlightedBones.includes(`Phalanges ${nameSuffix}`))} />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>
        );
    };

    return (
        <group>
            <Arm side="L" />
            <Arm side="R" />
        </group>
    );
};

// --- Part 5: LOWER LIMBS ---
const LowerLimbs = ({ highlightedBones, onToggle }: { highlightedBones: string[]; onToggle?: (n: string) => void }) => {
    // Pelvis center ~ Y=1.15 (Sacrum level)
    const pelvisY = 1.15;
    const hipWidth = 0.14; // Half of 280mm

    const Leg = ({ side }: { side: "L" | "R" }) => {
        const s = side === "R" ? 1 : -1;
        const nameSuffix = `(${side})`;

        return (
            <group>
                {/* Hip Bone (Ilium/Ischium/Pubis) - Large plate */}
                <mesh
                    position={[s * 0.09, pelvisY, 0.05]}
                    rotation={[0, 0, s * -0.2]}
                    onClick={(e) => { e.stopPropagation(); onToggle?.(`Hip Bone ${nameSuffix}`); }}
                >
                    {/* Irregular shape approximated by box with some rotation */}
                    <boxGeometry args={[0.12, 0.18, 0.08]} />
                    <primitive object={useBoneMaterial(highlightedBones.includes(`Hip Bone ${nameSuffix}`))} />
                </mesh>

                {/* Femur (Thigh) - 480mm = 0.48m */}
                {/* Hip Joint at Y ~ 1.10, X ~ +/- 0.14 */}
                <group position={[s * hipWidth, pelvisY - 0.05, 0.05]}>
                    <mesh
                        position={[0, -0.24, 0]} // Center of 0.48m length
                        rotation={[0, 0, s * -0.05]} // Slight inward angle (valgus)
                        onClick={(e) => { e.stopPropagation(); onToggle?.(`Femur ${nameSuffix}`); }}
                    >
                        <cylinderGeometry args={[0.025, 0.025, 0.48, 12]} />
                        <primitive object={useBoneMaterial(highlightedBones.includes(`Femur ${nameSuffix}`))} />
                    </mesh>

                    {/* Knee Joint */}
                    <group position={[0, -0.48, 0]}>
                        {/* Patella (Kneecap) - 40mm = 0.04m */}
                        <mesh
                            position={[0, 0, 0.035]}
                            onClick={(e) => { e.stopPropagation(); onToggle?.(`Patella ${nameSuffix}`); }}
                        >
                            <sphereGeometry args={[0.025, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                            <primitive object={useBoneMaterial(highlightedBones.includes(`Patella ${nameSuffix}`))} />
                        </mesh>

                        {/* Tibia (Shin) - 370mm = 0.37m - Inner/Thick */}
                        <mesh
                            position={[s * -0.015, -0.185, 0]}
                            onClick={(e) => { e.stopPropagation(); onToggle?.(`Tibia ${nameSuffix}`); }}
                        >
                            {/* Triangular prism approx by cylinder with 3 segments? Or just cylinder */}
                            <cylinderGeometry args={[0.025, 0.02, 0.37, 8]} />
                            <primitive object={useBoneMaterial(highlightedBones.includes(`Tibia ${nameSuffix}`))} />
                        </mesh>

                        {/* Fibula (Calf) - 360mm = 0.36m - Outer/Thin */}
                        <mesh
                            position={[s * 0.025, -0.18, 0]}
                            onClick={(e) => { e.stopPropagation(); onToggle?.(`Fibula ${nameSuffix}`); }}
                        >
                            <cylinderGeometry args={[0.01, 0.01, 0.36, 6]} />
                            <primitive object={useBoneMaterial(highlightedBones.includes(`Fibula ${nameSuffix}`))} />
                        </mesh>

                        {/* Foot */}
                        <group position={[0, -0.38, 0.05]}>
                            {/* Tarsals (Heel/Ankle) */}
                            <mesh
                                position={[0, 0.02, -0.05]}
                                onClick={(e) => { e.stopPropagation(); onToggle?.(`Tarsals ${nameSuffix}`); }}
                            >
                                <boxGeometry args={[0.05, 0.04, 0.08]} />
                                <primitive object={useBoneMaterial(highlightedBones.includes(`Tarsals ${nameSuffix}`))} />
                            </mesh>

                            {/* Metatarsals (Midfoot) */}
                            <mesh
                                position={[0, -0.01, 0.04]}
                                rotation={[0.2, 0, 0]} // Slope down
                                onClick={(e) => { e.stopPropagation(); onToggle?.(`Metatarsals ${nameSuffix}`); }}
                            >
                                <boxGeometry args={[0.05, 0.02, 0.10]} />
                                <primitive object={useBoneMaterial(highlightedBones.includes(`Metatarsals ${nameSuffix}`))} />
                            </mesh>

                            {/* Phalanges (Toes) */}
                            <mesh
                                position={[0, -0.03, 0.11]}
                                onClick={(e) => { e.stopPropagation(); onToggle?.(`Phalanges ${nameSuffix}`); }}
                            >
                                <boxGeometry args={[0.05, 0.015, 0.05]} />
                                <primitive object={useBoneMaterial(highlightedBones.includes(`Phalanges ${nameSuffix}`))} />
                            </mesh>
                        </group>
                    </group>
                </group>
            </group>
        );
    };

    return (
        <group>
            <Leg side="L" />
            <Leg side="R" />
        </group>
    );
};


// --- Main Component ---
export default function ProceduralSkeleton({ highlightedBones = [], onToggle }: ProceduralSkeletonProps) {
    return (
        <div className="w-full h-[600px] bg-gradient-to-b from-slate-50 to-slate-200 rounded-xl border overflow-hidden relative shadow-sm">
            <Canvas camera={{ position: [0, 1.2, 2.5], fov: 50 }}>
                {/* Lighting Setup */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} />
                <pointLight position={[0, 1.5, 2]} intensity={0.5} />

                {/* Scene Content */}
                <group position={[0, -0.8, 0]}> {/* Center height adjustment */}
                    <Skull highlightedBones={highlightedBones} onToggle={onToggle} />
                    <Spine highlightedBones={highlightedBones} onToggle={onToggle} />
                    <ThoracicCage highlightedBones={highlightedBones} onToggle={onToggle} />
                    <UpperLimbs highlightedBones={highlightedBones} onToggle={onToggle} />
                    <LowerLimbs highlightedBones={highlightedBones} onToggle={onToggle} />
                </group>

                {/* Controls & Environment */}
                <OrbitControls
                    target={[0, 1, 0]}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.5}
                    enablePan={true}
                />
                <Environment preset="city" />
            </Canvas>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 pointer-events-none">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <BoxIcon className="w-4 h-4" />
                    3D Skeleton (Procedural)
                </h3>
                <p className="text-[10px] text-slate-500 max-w-[150px]">
                    Scroll to zoom. Drag to rotate. Click bones to identify.
                </p>
            </div>

            {/* Interaction Hint */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-[10px] text-slate-500 bg-white/80 px-3 py-1 rounded-full shadow-sm border">
                    Geometric model based on anatomical sizing
                </span>
            </div>
        </div>
    );
}
