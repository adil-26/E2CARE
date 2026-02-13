
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect, ErrorInfo } from "react";
import { Box } from "lucide-react";
import * as THREE from "three";
import React from "react";

interface Skeleton3DProps {
    onToggle?: (boneName: string) => void;
    highlightedBones?: string[];
}

function Model({ highlightedBones, onToggle }: { highlightedBones: string[], onToggle?: (name: string) => void }) {
    // Try to load model, if fails catch will be handled by ErrorBoundary in parent
    const { scene } = useGLTF("/models/skeleton.glb");
    const meshRef = useRef<THREE.Group>(null);

    // Traverse materials to highlight
    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    // If this mesh name is in highlighted bones, make it red
                    // This logic depends on the specific GLTF hierarchy names
                    if (highlightedBones.includes(mesh.name)) {
                        (mesh.material as THREE.MeshStandardMaterial).color.set('#f87171');
                    } else {
                        (mesh.material as THREE.MeshStandardMaterial).color.set('#e2e8f0');
                    }
                }
            });
        }
    }, [highlightedBones, scene]);

    return (
        <primitive
            ref={meshRef}
            object={scene}
            scale={2.5}
            position={[0, -2, 0]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                if (onToggle && e.object.name) {
                    onToggle(e.object.name);
                }
            }}
        />
    );
}

// Simple placeholder if model fails or loads
function Placeholder() {
    return (
        <mesh>
            <boxGeometry args={[1, 2, 0.5]} />
            <meshStandardMaterial color="orange" wireframe />
        </mesh>
    )
}

// Error Boundary for R3F Canvas
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { fallback: React.ReactNode, children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("3D Model Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default function Skeleton3D({ onToggle, highlightedBones = [] }: Skeleton3DProps) {
    const [modelError, setModelError] = useState(false);

    // Fallback UI if model is missing
    if (modelError) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[500px] bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 p-6 text-center">
                <Box className="w-12 h-12 mb-3 opacity-20" />
                <h3 className="font-semibold text-slate-600 mb-1">3D Viewer Unavailable</h3>
                <p className="text-sm">
                    To enable 3D view, please add a <code>skeleton.glb</code> file to your
                    <code>public/models/</code> directory.
                </p>
                <p className="text-xs mt-4 text-muted-foreground">
                    Using 2D diagram as fallback.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full h-[500px] bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl border overflow-hidden relative shadow-sm">
            <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -5, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <ErrorBoundary fallback={<Placeholder />}>
                        <Model highlightedBones={highlightedBones} onToggle={onToggle} />
                        <Environment preset="city" />
                    </ErrorBoundary>
                </Suspense>

                <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={10} />
            </Canvas>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border shadow-sm">
                    <Box className="w-3 h-3" />
                    Interactive 3D • Drag to Rotate
                </span>
            </div>
        </div>
    );
}
