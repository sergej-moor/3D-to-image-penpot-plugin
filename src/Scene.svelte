<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

  export let selection: {
    name: string;
    width: number;
    height: number;
    type: string;
    id: string;
  } | undefined;

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let imagePlane: THREE.Mesh;

  onMount(() => {
    initThreeJS();
    animate();

    return () => {
      renderer?.dispose();
      scene?.clear();
    };
  });

  function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.z = 1000;

    // Renderer setup with alpha
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xf5f5f5, 1);
    container.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  export const displayImageData = (imageData: number[], width: number, height: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;

    const uint8Array = new Uint8Array(imageData);
    const blob = new Blob([uint8Array], { type: 'image/png' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.premultiplyAlpha = false;

      // Remove existing plane if it exists
      if (imagePlane) {
        scene.remove(imagePlane);
        imagePlane.geometry.dispose();
        imagePlane.material.dispose();
      }

      // Create plane with transparent material
      const planeGeometry = new THREE.PlaneGeometry(width, height);
      const planeMaterial = new THREE.MeshStandardMaterial({ 
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.1,
      });
      
      imagePlane = new THREE.Mesh(planeGeometry, planeMaterial);
      scene.add(imagePlane);

      // Adjust camera to fit object
      const aspectRatio = width / height;
      const distance = Math.max(width, height) * 2;
      camera.position.z = distance;
      controls.target.set(0, 0, 0);
      controls.update();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
</script>

<div class="scene-container" bind:this={container}>
  {#if !selection}
    <p class="no-selection">No selection</p>
  {/if}
</div>

<style>
  .scene-container {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f5f5f5;
    position: relative;
  }

  .no-selection {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }
</style>