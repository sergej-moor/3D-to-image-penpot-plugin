<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
  import { selectionsStore } from './stores/selections';
  import SelectionControls from './SelectionControls.svelte';

  export let selection: {
    name: string;
    width: number;
    height: number;
    type: string;
    id: string;
    x: number;
    y: number;
  }[] | undefined;

  export let isLoading: boolean;

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let imagePlanes: THREE.Mesh[] = [];

  let selectionControls: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
  }> = [];

  $: if (selection) {
    selectionControls = selection;
    selectionsStore.initialize(selection);
  }

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
    scene.background = null;

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.z = 1000;

    // Renderer setup with alpha
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff,3);
    scene.add(ambientLight);

   
/*     const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight); */
 
    const topLight = new THREE.DirectionalLight(0xffffff, 1);
    topLight.position.set(0, 1, 0);
    scene.add(topLight); 
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  // Add a constant for z-index scaling
  const Z_INDEX_SCALE = 20; // Adjust this value to make depth changes more/less pronounced

  export const displayMultipleImages = (exports: { 
    imageData: number[], 
    width: number, 
    height: number,
    x: number,
    y: number 
  }[]) => {
    // Clear existing planes
    imagePlanes.forEach(plane => {
      scene.remove(plane);
      plane.geometry.dispose();
      plane.material.dispose();
    });
    imagePlanes = [];

    // Find the center point of all elements
    const bounds = exports.reduce((acc, exp) => {
      acc.minX = Math.min(acc.minX, exp.x);
      acc.maxX = Math.max(acc.maxX, exp.x + exp.width);
      acc.minY = Math.min(acc.minY, exp.y);
      acc.maxY = Math.max(acc.maxY, exp.y + exp.height);
      return acc;
    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    // Create planes for each image at their original positions
    exports.forEach((exp, index) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = exp.width * 2;
      canvas.height = exp.height * 2;

      const uint8Array = new Uint8Array(exp.imageData);
      const blob = new Blob([uint8Array], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.premultiplyAlpha = false;

        const planeGeometry = new THREE.PlaneGeometry(exp.width, exp.height);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
          alphaTest: 0.1,
          roughness: 0.2,
          metalness: 0.0,
        });
        
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        
        // Position relative to center, and flip Y coordinate (Penpot Y grows down, Three.js Y grows up)
        plane.position.x = exp.x - centerX + (exp.width / 2);
        plane.position.y = -(exp.y - centerY + (exp.height / 2));
        
        // Subscribe to z-index changes
        const unsubscribe = selectionsStore.subscribe(state => {
          if (state[selection![index].id]) {
            plane.position.z = state[selection![index].id].zIndex * Z_INDEX_SCALE;
          }
        });
        
        scene.add(plane);
        imagePlanes.push(plane);

        // Update camera position to fit all elements
        const width = bounds.maxX - bounds.minX;
        const height = bounds.maxY - bounds.minY;
        const distance = Math.max(width, height) * 1.2;
        camera.position.z = distance;
        controls.target.set(0, 0, 0);
        controls.update();

        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  export const captureView = async () => {
    return new Promise<Uint8Array>((resolve) => {
      // Clear the background before capture
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      
      // Render the scene
      renderer.render(scene, camera);
      
      // Get the canvas data
      const canvas = renderer.domElement;
      
      // Convert to blob with alpha channel
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          resolve(new Uint8Array(arrayBuffer));
        };
        reader.readAsArrayBuffer(blob!);
      }, 'image/png');
    });
  };
</script>

<div class="container">
  <div class="controls-panel">
    {#each selectionControls as sel}
      <SelectionControls selection={sel} />
    {/each}
  </div>
  <div class="scene-container" bind:this={container}>
    {#if !selection}
      <p class="overlay-text">No selection</p>
    {:else if isLoading}
      <div class="overlay">
        <div class="spinner"></div>
        <p class="overlay-text">Loading preview...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 1rem;
    height: 400px;
  }

  .controls-panel {
    width: 300px;
    padding: 1rem;
    background: var(--background-color, white);
    border-radius: 8px;
    overflow-y: auto;
  }

  .scene-container {
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f5f5f5;
    position: relative;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(245, 245, 245, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 10;
  }

  .overlay-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    color: #666;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--button-primary-color, #2c5282);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>