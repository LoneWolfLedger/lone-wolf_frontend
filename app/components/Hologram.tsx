'use client';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

export default function Hologram() {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', background: '#0f172a' }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
                    <Sphere args={[1.5, 64, 64]}>
                        <MeshDistortMaterial color="#38bdf8" attach="material" distort={0.4} speed={2} wireframe={true} transparent={true} opacity={0.15} />
                    </Sphere>
                </Float>
            </Canvas>
        </div>
    );
}