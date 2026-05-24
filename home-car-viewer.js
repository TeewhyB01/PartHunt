import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const container = document.querySelector("#homeCarViewer");

if (container) {
  container.classList.remove("sketchfab-car-viewer");
  container.classList.add("skeletal-car-viewer");
  container.innerHTML = `
    <div class="viewer-status">
      <strong>Skeletal 3D vehicle selector</strong>
      <span>Drag to rotate</span>
    </div>
    <div class="viewer-part-label label-front">Front bumper</div>
    <div class="viewer-part-label label-cabin">Cabin frame</div>
    <div class="viewer-part-label label-engine">Engine bay</div>
    <div class="viewer-part-label label-wheel">Wheel assembly</div>
  `;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(4.8, 2.6, 6.3);
  camera.lookAt(0, 0.25, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.prepend(renderer.domElement);

  const car = new THREE.Group();
  car.rotation.y = -0.45;
  car.rotation.x = -0.04;
  scene.add(car);

  const blue = new THREE.LineBasicMaterial({ color: 0x70a5ff, transparent: true, opacity: 0.96 });
  const teal = new THREE.LineBasicMaterial({ color: 0x64e6d2, transparent: true, opacity: 0.92 });
  const violet = new THREE.LineBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.8 });
  const softBlue = new THREE.LineBasicMaterial({ color: 0x70a5ff, transparent: true, opacity: 0.28 });

  const addLine = (points, material = teal) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
    const line = new THREE.Line(geometry, material);
    car.add(line);
    return line;
  };

  const addCurve = (points, material = teal, segments = 40) => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));
    const line = new THREE.Line(geometry, material);
    car.add(line);
    return line;
  };

  const addEllipse = (center, radiusX, radiusY, z, material = softBlue, segments = 40) => {
    const points = [];
    for (let i = 0; i <= segments; i += 1) {
      const angle = (Math.PI * 2 * i) / segments;
      points.push([center[0] + Math.cos(angle) * radiusX, center[1] + Math.sin(angle) * radiusY, z]);
    }
    return addLine(points, material);
  };

  const addRect = (x1, y1, x2, y2, z, material = softBlue) => {
    addLine(
      [
        [x1, y1, z],
        [x2, y1, z],
        [x2, y2, z],
        [x1, y2, z],
        [x1, y1, z],
      ],
      material
    );
  };

  const mirrorPoints = (points) => points.map(([x, y, z]) => [x, y, -z]);

  const sideSilhouette = [
    [-2.9, -0.05, 0.93],
    [-2.55, 0.28, 0.91],
    [-1.65, 0.48, 0.86],
    [-0.72, 1.22, 0.78],
    [0.38, 1.54, 0.7],
    [1.24, 1.18, 0.76],
    [2.1, 0.48, 0.86],
    [2.86, 0.18, 0.92],
  ];
  const lowerRail = [
    [-2.9, -0.28, 0.96],
    [-2.05, -0.33, 1.02],
    [-0.85, -0.23, 1.06],
    [0.8, -0.22, 1.06],
    [2.0, -0.32, 1.02],
    [2.9, -0.22, 0.96],
  ];
  const shoulderRail = [
    [-2.72, 0.28, 0.9],
    [-1.45, 0.58, 0.94],
    [-0.12, 0.76, 0.98],
    [1.34, 0.64, 0.96],
    [2.63, 0.32, 0.9],
  ];
  const roofCrown = [
    [-0.86, 1.18, 0.58],
    [-0.28, 1.62, 0.47],
    [0.5, 1.72, 0.42],
    [1.12, 1.25, 0.55],
  ];
  const bonnetCurve = [
    [-2.85, 0.16, 0.72],
    [-2.22, 0.5, 0.7],
    [-1.42, 0.58, 0.68],
    [-0.88, 0.48, 0.74],
  ];
  const bootCurve = [
    [1.12, 0.54, 0.74],
    [1.76, 0.54, 0.7],
    [2.42, 0.34, 0.73],
    [2.9, 0.12, 0.78],
  ];

  [sideSilhouette, lowerRail, shoulderRail, roofCrown, bonnetCurve, bootCurve].forEach((points) => {
    addCurve(points, teal);
    addCurve(mirrorPoints(points), teal);
  });

  addCurve([[-2.9, -0.05, 0.93], [-2.98, 0.08, 0.38], [-3.0, 0.1, 0], [-2.98, 0.08, -0.38], [-2.9, -0.05, -0.93]], blue);
  addCurve([[2.9, -0.22, 0.96], [3.02, -0.02, 0.42], [3.04, 0.02, 0], [3.02, -0.02, -0.42], [2.9, -0.22, -0.96]], blue);
  addCurve([[-1.34, 0.5, 0.78], [-1.55, 0.66, 0.28], [-1.56, 0.7, 0], [-1.55, 0.66, -0.28], [-1.34, 0.5, -0.78]], violet);
  addCurve([[-0.76, 1.22, 0.72], [-0.74, 1.36, 0.22], [-0.72, 1.38, 0], [-0.74, 1.36, -0.22], [-0.76, 1.22, -0.72]], blue);
  addCurve([[1.14, 1.2, 0.72], [1.16, 1.34, 0.22], [1.18, 1.36, 0], [1.16, 1.34, -0.22], [1.14, 1.2, -0.72]], blue);
  addCurve([[-2.42, -0.18, 0.98], [-1.0, -0.1, 1.08], [0.6, -0.08, 1.08], [2.42, -0.18, 0.98]], softBlue);
  addCurve(mirrorPoints([[-2.42, -0.18, 0.98], [-1.0, -0.1, 1.08], [0.6, -0.08, 1.08], [2.42, -0.18, 0.98]]), softBlue);

  const addWheelArch = (x, z, material = violet) => {
    const points = [];
    for (let i = 0; i <= 28; i += 1) {
      const angle = Math.PI * (i / 28);
      points.push([x + Math.cos(angle) * 0.64, -0.35 + Math.sin(angle) * 0.62, z]);
    }
    addLine(points, material);
  };

  [-1.72, 1.72].forEach((x) => {
    addWheelArch(x, 1.04);
    addWheelArch(x, -1.04);
  });

  for (let x = -2.2; x <= 2.2; x += 0.55) {
    addLine([[x, -0.28, 0.92], [x, -0.24, -0.92]], softBlue);
  }

  for (let z = -0.68; z <= 0.68; z += 0.34) {
    addCurve([[-2.65, 0.06, z], [-1.35, 0.36, z], [0.28, 0.48, z], [1.78, 0.34, z], [2.68, 0.06, z]], softBlue, 30);
  }

  const addSideDetails = (z) => {
    const side = z > 0 ? 1 : -1;
    addRect(-0.7, 0.58, 0.1, 1.14, z, blue);
    addRect(0.18, 0.54, 0.98, 1.04, z, blue);
    addLine([[-0.78, 1.12, z], [0.18, 1.42, z], [1.08, 1.12, z]], softBlue);
    addLine([[-0.18, 0.5, z], [-0.18, 1.28, z]], violet);
    addLine([[0.98, 0.5, z], [0.98, 1.06, z]], violet);
    addLine([[-0.72, 0.5, z], [-0.72, 0.0, z]], softBlue);
    addLine([[1.08, 0.52, z], [1.08, -0.04, z]], softBlue);
    addCurve([[1.18, 0.54, z], [1.46, 0.54, z], [1.66, 0.48, z]], softBlue, 16);
    addCurve([[-1.18, 0.48, z], [-1.32, 0.58, z + side * 0.18], [-1.5, 0.56, z + side * 0.26]], teal, 12);
    addLine([[-1.5, 0.56, z + side * 0.26], [-1.64, 0.49, z + side * 0.26]], teal);
  };

  addSideDetails(1.03);
  addSideDetails(-1.03);

  [-1.92, -1.72, -1.52, 1.52, 1.72, 1.92].forEach((x) => {
    addCurve([[x, -0.45, 1.02], [x, -0.21, 1.02], [x, -0.45, 1.02]], softBlue, 12);
    addCurve([[x, -0.45, -1.02], [x, -0.21, -1.02], [x, -0.45, -1.02]], softBlue, 12);
  });

  addCurve([[-2.98, 0.0, 0.42], [-2.96, 0.18, 0.23], [-2.94, 0.19, 0.02], [-2.96, 0.18, -0.23], [-2.98, 0.0, -0.42]], teal, 30);
  addCurve([[-2.98, 0.16, 0.78], [-2.98, 0.28, 0.52], [-2.98, 0.28, 0.3]], blue, 16);
  addCurve([[-2.98, 0.16, -0.78], [-2.98, 0.28, -0.52], [-2.98, 0.28, -0.3]], blue, 16);
  for (let z = -0.38; z <= 0.38; z += 0.19) {
    addLine([[-3.02, 0.04, z], [-2.86, 0.22, z]], softBlue);
  }

  addCurve([[3.02, -0.02, 0.78], [3.05, 0.14, 0.5], [3.04, 0.15, 0.24]], violet, 16);
  addCurve([[3.02, -0.02, -0.78], [3.05, 0.14, -0.5], [3.04, 0.15, -0.24]], violet, 16);
  addLine([[2.62, 0.14, 0.84], [2.62, 0.14, -0.84]], softBlue);

  addRect(-1.72, 0.12, -1.18, 0.42, 0.34, violet);
  addRect(-1.72, 0.12, -1.18, 0.42, -0.34, violet);
  addRect(-2.22, -0.1, -1.95, 0.2, 0.24, softBlue);
  addRect(-2.22, -0.1, -1.95, 0.2, -0.24, softBlue);
  addLine([[-2.46, -0.15, 0.42], [-2.06, -0.15, 0.42]], softBlue);
  addLine([[-2.46, -0.15, -0.42], [-2.06, -0.15, -0.42]], softBlue);

  [[-0.2, 0.25, 0.28], [0.58, 0.23, 0.28], [-0.2, 0.25, -0.28], [0.58, 0.23, -0.28]].forEach(([x, y, z]) => {
    addCurve([[x - 0.18, y, z], [x - 0.1, y + 0.38, z], [x + 0.22, y + 0.4, z], [x + 0.32, y, z]], violet, 18);
    addLine([[x - 0.08, y, z], [x - 0.08, y - 0.28, z]], softBlue);
    addLine([[x + 0.2, y, z], [x + 0.2, y - 0.28, z]], softBlue);
  });
  addEllipse([-0.62, 0.62], 0.18, 0.18, 0.34, teal, 28);
  addLine([[-0.62, 0.62, 0.34], [-0.86, 0.42, 0.45]], teal);
  addLine([[-0.92, 0.42, 0.52], [-0.22, 0.42, 0.52]], softBlue);
  addLine([[-0.92, 0.36, 0.5], [-0.22, 0.36, 0.5]], softBlue);

  const wheelMaterial = new THREE.MeshBasicMaterial({ color: 0x64e6d2, wireframe: true, transparent: true, opacity: 0.9 });
  const tireMaterial = new THREE.LineBasicMaterial({ color: 0xf9fafb, transparent: true, opacity: 0.7 });
  const wheelPositions = [
    [-1.72, -0.45, -0.98],
    [-1.72, -0.45, 0.98],
    [1.72, -0.45, -0.98],
    [1.72, -0.45, 0.98],
  ];

  wheelPositions.forEach((position) => {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.075, 10, 28), wheelMaterial);
    wheel.position.set(...position);
    car.add(wheel);

    const hub = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.21, 0.21, 0.14, 14)), tireMaterial);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(...position);
    car.add(hub);

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const endY = position[1] + Math.sin(angle) * 0.34;
      const endZ = position[2] + Math.cos(angle) * 0.34 * Math.sign(position[2]);
      addLine([[position[0], position[1], position[2]], [position[0], endY, endZ]], tireMaterial);
    }
  });

  addLine([[-1.72, -0.45, -0.98], [-1.72, -0.45, 0.98]], blue);
  addLine([[1.72, -0.45, -0.98], [1.72, -0.45, 0.98]], blue);

  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x70a5ff, transparent: true, opacity: 0.75 });
  [
    [-2.92, 0.18, -0.72],
    [-2.92, 0.18, 0.72],
    [-1.55, 0.66, 0],
    [0.32, 1.5, 0],
  ].forEach((position) => {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), markerMaterial);
    marker.position.set(...position);
    car.add(marker);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const rim = new THREE.DirectionalLight(0x70a5ff, 1.8);
  rim.position.set(-3, 4, 5);
  scene.add(rim);

  let dragging = false;
  let lastX = 0;
  let targetRotation = car.rotation.y;

  container.addEventListener("pointerdown", (event) => {
    dragging = true;
    lastX = event.clientX;
    container.setPointerCapture(event.pointerId);
  });

  container.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    targetRotation += (event.clientX - lastX) * 0.008;
    lastX = event.clientX;
  });

  container.addEventListener("pointerup", () => {
    dragging = false;
  });

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const animate = () => {
    targetRotation += dragging ? 0 : 0.0024;
    car.rotation.y += (targetRotation - car.rotation.y) * 0.06;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
