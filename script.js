
const ETAGE_HEIGHT = 3;
const BUILDING_WIDTH = 9;
const BUILDING_LENGTH = 49;
const ETAGE_COUNT = 8;

function init3DModel() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(40, 25, 40);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.5;
  controls.maxDistance = 20;
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(20, 30, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);
  
  const spotLight = new THREE.SpotLight(0xffffff, 0.5);
  spotLight.position.set(-20, 40, -20);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const groundSize = 200;
  const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x228B22,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  scene.add(ground);
  
  const roadWidth = 10;
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const frontRoadGeometry = new THREE.PlaneGeometry(BUILDING_WIDTH + roadWidth * 2, roadWidth);
  const frontRoad = new THREE.Mesh(frontRoadGeometry, roadMaterial);
  frontRoad.rotation.x = -Math.PI / 2;
  frontRoad.position.set(0, 0, BUILDING_LENGTH / 2 + roadWidth / 2);
  scene.add(frontRoad);
  
  const leftRoadGeometry = new THREE.PlaneGeometry(roadWidth, BUILDING_LENGTH);
  const leftRoad = new THREE.Mesh(leftRoadGeometry, roadMaterial);
  leftRoad.rotation.x = -Math.PI / 2;
  leftRoad.position.set(-BUILDING_WIDTH / 2 - roadWidth / 2, 0, 0);
  scene.add(leftRoad);

  const buildingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xEEEEEE, 
    roughness: 0.3,
    metalness: 0.2
  });
  
  const glassMaterial = new THREE.MeshPhysicalMaterial({ 
    color: 0x2196F3, 
    transparent: true, 
    opacity: 0.7,
    roughness: 0.1, 
    metalness: 0.9,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });
  
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, 
    roughness: 0.5, 
    metalness: 0.3 
  });
  
  const shutterMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x9E9E9E,
    roughness: 0.4,
    metalness: 0.8
  });
  
  const corridorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xE0E0E0,
    roughness: 0.3
  });
  
  const officeDoorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x795548,
    roughness: 0.5
  });
  
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x424242,
    roughness: 0.3,
    metalness: 0.7
  });

  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xF5F5F5,
    roughness: 0.3,
    metalness: 0.1
  });

  let officeGroup = null;
  let buildingGroup = null;

  function createBuilding() {
    const building = new THREE.Group();
    buildingGroup = building;
    
    for (let i = 0; i < ETAGE_COUNT; i++) {
      const etageGeometry = new THREE.BoxGeometry(BUILDING_WIDTH, ETAGE_HEIGHT, BUILDING_LENGTH);
      const etage = new THREE.Mesh(etageGeometry, buildingMaterial);
      etage.position.y = i * ETAGE_HEIGHT + ETAGE_HEIGHT / 2;
      etage.castShadow = true;
      etage.receiveShadow = true;
      building.add(etage);
      
      if (i === 0) {
        addRdcDetails(etage);
      } else {
        addOfficeDetails(etage, i);
      }
    }
    
    addRoofDetails(building, ETAGE_COUNT * ETAGE_HEIGHT);
    scene.add(building);
  }

  function addRdcDetails(etage) {
    const doorWidth = 2;
    const doorHeight = 2.5;
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.2);
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(BUILDING_WIDTH / 2 - doorWidth / 2, -0.25, BUILDING_LENGTH / 2 + 0.1);
    etage.add(door);
    
    const doorFrameGeometry = new THREE.BoxGeometry(doorWidth + 0.4, doorHeight + 0.4, 0.1);
    const doorFrame = new THREE.Mesh(doorFrameGeometry, frameMaterial);
    doorFrame.position.set(BUILDING_WIDTH / 2 - doorWidth / 2, -0.25, BUILDING_LENGTH / 2 + 0.05);
    etage.add(doorFrame);
    
    const shutterWidth = (BUILDING_WIDTH - doorWidth) / 2;
    for (let i = 0; i < 2; i++) {
      const shutterGeometry = new THREE.BoxGeometry(shutterWidth, 2.5, 0.1);
      const shutter = new THREE.Mesh(shutterGeometry, shutterMaterial);
      shutter.position.set(
        -BUILDING_WIDTH / 2 + shutterWidth / 2 + i * shutterWidth,
        -0.25,
        BUILDING_LENGTH / 2 + 0.1
      );
      etage.add(shutter);
    }
    
    const shutterSideWidth = BUILDING_LENGTH / 10;
    for (let i = 0; i < 10; i++) {
      const shutterGeometry = new THREE.BoxGeometry(0.1, 2.5, shutterSideWidth - 0.2);
      const shutter = new THREE.Mesh(shutterGeometry, shutterMaterial);
      shutter.position.set(
        -BUILDING_WIDTH / 2 - 0.1,
        -0.25,
        BUILDING_LENGTH / 2 - shutterSideWidth / 2 - i * shutterSideWidth
      );
      etage.add(shutter);
    }
  }

  function addOfficeDetails(etage, etageNumber) {
    const windowHeight = ETAGE_HEIGHT * 0.7;
    const windowCount = 10;
    const windowWidth = BUILDING_LENGTH / windowCount;
    
    for (let i = 0; i < windowCount; i++) {
      const windowGeometry = new THREE.BoxGeometry(0.1, windowHeight, windowWidth - 0.5);
      const window = new THREE.Mesh(windowGeometry, glassMaterial);
      window.position.set(
        -BUILDING_WIDTH / 2 - 0.1,
        0,
        BUILDING_LENGTH / 2 - windowWidth / 2 - i * windowWidth
      );
      etage.add(window);
      
      const frameGeometry = new THREE.BoxGeometry(0.15, windowHeight + 0.2, windowWidth - 0.3);
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(
        -BUILDING_WIDTH / 2 - 0.05,
        0,
        BUILDING_LENGTH / 2 - windowWidth / 2 - i * windowWidth
      );
      etage.add(frame);
    }
    
    const frontWindowCount = 4;
    const frontWindowWidth = BUILDING_WIDTH / frontWindowCount;
    
    for (let i = 0; i < frontWindowCount; i++) {
      const frontWindowGeometry = new THREE.BoxGeometry(frontWindowWidth - 0.3, windowHeight, 0.1);
      const frontWindow = new THREE.Mesh(frontWindowGeometry, glassMaterial);
      frontWindow.position.set(
        -BUILDING_WIDTH / 2 + frontWindowWidth / 2 + i * frontWindowWidth,
        0,
        BUILDING_LENGTH / 2 + 0.1
      );
      etage.add(frontWindow);
      
      const frontFrameGeometry = new THREE.BoxGeometry(frontWindowWidth - 0.1, windowHeight + 0.2, 0.15);
      const frontFrame = new THREE.Mesh(frontFrameGeometry, frameMaterial);
      frontFrame.position.set(
        -BUILDING_WIDTH / 2 + frontWindowWidth / 2 + i * frontWindowWidth,
        0,
        BUILDING_LENGTH / 2 + 0.05
      );
      etage.add(frontFrame); // Correction : frame -> frontFrame
    }
    
    const corridorGeometry = new THREE.BoxGeometry(1.5, ETAGE_HEIGHT - 0.2, BUILDING_LENGTH - 1);
    const corridor = new THREE.Mesh(corridorGeometry, corridorMaterial);
    corridor.position.set(0, 0, -0.5);
    etage.add(corridor);
    
    const officeCount = 8;
    const officeLength = (BUILDING_LENGTH - 1) / (officeCount / 2);
    
    for (let i = 0; i < officeCount / 2; i++) {
      const leftDoorGeometry = new THREE.BoxGeometry(0.1, 2, 1);
      const leftDoor = new THREE.Mesh(leftDoorGeometry, officeDoorMaterial);
      leftDoor.position.set(-0.75, -0.5, BUILDING_LENGTH / 2 - 2 - i * officeLength);
      etage.add(leftDoor);
      
      const leftFrameGeometry = new THREE.BoxGeometry(0.15, 2.1, 1.1);
      const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
      leftFrame.position.set(-0.725, -0.5, BUILDING_LENGTH / 2 - 2 - i * officeLength);
      etage.add(leftFrame);
      
      const rightDoorGeometry = new THREE.BoxGeometry(0.1, 2, 1);
      const rightDoor = new THREE.Mesh(rightDoorGeometry, officeDoorMaterial);
      rightDoor.position.set(0.75, -0.5, BUILDING_LENGTH / 2 - 2 - i * officeLength);
      etage.add(rightDoor);
      
      const rightFrameGeometry = new THREE.BoxGeometry(0.15, 2.1, 1.1);
      const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
      rightFrame.position.set(0.725, -0.5, BUILDING_LENGTH / 2 - 2 - i * officeLength);
      etage.add(rightFrame);
    }
    
    const stairGeometry = new THREE.BoxGeometry(1.5, ETAGE_HEIGHT - 0.2, 3);
    const stairMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x607D8B,
      roughness: 0.6,
      metalness: 0.2
    });
    const stair = new THREE.Mesh(stairGeometry, stairMaterial);
    stair.position.set(0, 0, BUILDING_LENGTH / 2 - 1.5);
    etage.add(stair);
  }
  
  function addRoofDetails(building, topHeight) {
    const roofStructureGeometry = new THREE.BoxGeometry(4, 2, 4);
    const roofStructureMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x424242,
      roughness: 0.5,
      metalness: 0.3
    });
    const roofStructure = new THREE.Mesh(roofStructureGeometry, roofStructureMaterial);
    roofStructure.position.set(0, topHeight + 1, 0);
    roofStructure.castShadow = true;
    building.add(roofStructure);
    
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    const antennaMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x9E9E9E,
      roughness: 0.3,
      metalness: 0.9
    });
    
    const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna1.position.set(-1, topHeight + 3.5, -1);
    building.add(antenna1);
    
    const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna2.position.set(1, topHeight + 3, 1);
    building.add(antenna2);
    
    const roofEdgeGeometry = new THREE.BoxGeometry(BUILDING_WIDTH + 0.5, 0.3, BUILDING_LENGTH + 0.5);
    const roofEdgeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x757575,
      roughness: 0.5,
      metalness: 0.3
    });
    const roofEdge = new THREE.Mesh(roofEdgeGeometry, roofEdgeMaterial);
    roofEdge.position.set(0, topHeight + 0.15, 0);
    building.add(roofEdge);
  }

  createBuilding();
  
  function addEnvironmentDetails() {
    const treeCount = 8;
    for (let i = 0; i < treeCount; i++) {
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      
      const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
      const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 2.5;
      
      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      
      const angle = (i / treeCount) * Math.PI * 2;
      const radius = 30;
      const x = Math.cos(angle) * radius;
      let z = Math.sin(angle) * radius;
      
      if (z > BUILDING_LENGTH / 2 - 10) {
        z += 15;
      }
      
      tree.position.set(x, 0, z);
      tree.castShadow = true;
      scene.add(tree);
    }
    
    for (let i = 0; i < 2; i++) {
      const benchGeometry = new THREE.BoxGeometry(2, 0.4, 0.8);
      const benchMaterial = new THREE.MeshStandardMaterial({ color: 0x795548 });
      const bench = new THREE.Mesh(benchGeometry, benchMaterial);
      
      const legGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.6);
      const legMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
      
      const leg1 = new THREE.Mesh(legGeometry, legMaterial);
      leg1.position.set(-0.8, -0.4, 0);
      bench.add(leg1);
      
      const leg2 = new THREE.Mesh(legGeometry, legMaterial);
      leg2.position.set(0.8, -0.4, 0);
      bench.add(leg2);
      
      bench.position.set(i === 0 ? -15 : 15, 0.4, BUILDING_LENGTH / 2 + 5);
      bench.castShadow = true;
      scene.add(bench);
    }
  }

  addEnvironmentDetails();

  function createOffice() {
    if (officeGroup) {
      scene.remove(officeGroup);
      officeGroup = null;
      scene.add(buildingGroup);
      camera.position.set(40, 25, 40);
      controls.target.set(0, 10, 0);
      controls.minDistance = 0.5;
      controls.maxDistance = 100;
      controls.enabled = true;
      return;
    }
    
    scene.remove(buildingGroup);
    officeGroup = new THREE.Group();
    
    const officeWidth = BUILDING_WIDTH; // 9m
    const officeDepth = 7;
    const officeHeight = ETAGE_HEIGHT;
    
    // Sol du bureau
    const floorGeometry = new THREE.PlaneGeometry(officeWidth, officeDepth);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD3D3D3,
      roughness: 0.5,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    officeGroup.add(floor);
    
    // Murs du bureau
    // Mur arrière (avec porte d'entrée)
    const backWallGeometry = new THREE.BoxGeometry(officeWidth, officeHeight / 2, 0.2);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, officeHeight / 4, -officeDepth / 2);
    officeGroup.add(backWall);
    
    // Porte d'entrée (décalée à gauche sur le mur arrière)
    const doorWidth = 1.5;
    const doorGeometry = new THREE.BoxGeometry(doorWidth, 2, 0.1);
    const door = new THREE.Mesh(doorGeometry, officeDoorMaterial);
    door.position.set(-officeWidth / 2 + doorWidth / 2, -0.5, -officeDepth / 2 - 0.05);
    officeGroup.add(door);
    
    // Mur avant (avec 4 fenêtres)
    const frontWallGeometry = new THREE.BoxGeometry(officeWidth, officeHeight / 2, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, officeHeight / 4, officeDepth / 2);
    officeGroup.add(frontWall);
    
    // Quatre fenêtres sur la façade avant
    const windowCount = 4;
    const windowWidth = officeWidth / windowCount;
    for (let i = 0; i < windowCount; i++) {
      const windowGeometry = new THREE.BoxGeometry(windowWidth - 0.1, officeHeight / 2, 0.1);
      const window = new THREE.Mesh(windowGeometry, glassMaterial);
      window.position.set(
        -officeWidth / 2 + windowWidth / 2 + i * windowWidth,
        3 * officeHeight / 4,
        officeDepth / 2 + 0.05
      );
      officeGroup.add(window);
    }
    
    // Mur gauche
    const leftWallGeometry = new THREE.BoxGeometry(0.2, officeHeight, officeDepth);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-officeWidth / 2, officeHeight / 2, 0);
    officeGroup.add(leftWall);
    
    // Mur droit (séparation avec le WC)
    const rightWallGeometry = new THREE.BoxGeometry(0.2, officeHeight, officeDepth);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(officeWidth / 2, officeHeight / 2, 0);
    officeGroup.add(rightWall);
    
    // WC (à droite du bureau, pièce séparée)
    const bathroomWidth = 2;
    const bathroomDepth = officeDepth;
    // Sol du WC
    const bathroomFloorGeometry = new THREE.PlaneGeometry(bathroomWidth, bathroomDepth);
    const bathroomFloor = new THREE.Mesh(bathroomFloorGeometry, floorMaterial);
    bathroomFloor.rotation.x = -Math.PI / 2;
    bathroomFloor.position.set(officeWidth / 2 + bathroomWidth / 2, 0, 0);
    officeGroup.add(bathroomFloor);
    
    // Mur extérieur droit du WC
    const bathroomRightWallGeometry = new THREE.BoxGeometry(0.2, officeHeight, bathroomDepth);
    const bathroomRightWall = new THREE.Mesh(bathroomRightWallGeometry, wallMaterial);
    bathroomRightWall.position.set(officeWidth / 2 + bathroomWidth, officeHeight / 2, 0);
    officeGroup.add(bathroomRightWall);
    
    // Mur avant du WC
    const bathroomFrontWallGeometry = new THREE.BoxGeometry(bathroomWidth, officeHeight, 0.2);
    const bathroomFrontWall = new THREE.Mesh(bathroomFrontWallGeometry, wallMaterial);
    bathroomFrontWall.position.set(officeWidth / 2 + bathroomWidth / 2, officeHeight / 2, officeDepth / 2);
    officeGroup.add(bathroomFrontWall);
    
    // Mur arrière du WC
    const bathroomBackWallGeometry = new THREE.BoxGeometry(bathroomWidth, officeHeight / 2, 0.2);
    const bathroomBackWall = new THREE.Mesh(bathroomBackWallGeometry, wallMaterial);
    bathroomBackWall.position.set(officeWidth / 2 + bathroomWidth / 2, officeHeight / 4, -officeDepth / 2);
    officeGroup.add(bathroomBackWall);
    
    // Porte du WC (sur le mur arrière, à droite)
    const bathroomDoorGeometry = new THREE.BoxGeometry(0.1, 2, 1);
    const bathroomDoor = new THREE.Mesh(bathroomDoorGeometry, officeDoorMaterial);
    bathroomDoor.position.set(officeWidth / 2 + bathroomWidth - 0.5, -0.5, -officeDepth / 2 - 0.05);
    officeGroup.add(bathroomDoor);
    
    // Équipements WC
    const toiletGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const toiletMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const toilet = new THREE.Mesh(toiletGeometry, toiletMaterial);
    toilet.position.set(officeWidth / 2 + bathroomWidth / 2, 0.25, 0);
    officeGroup.add(toilet);
    
    // Plateau (déplacé en haut, près des fenêtres)
    const deskGeometry = new THREE.BoxGeometry(4, 0.8, 2);
    const deskMaterial = new THREE.MeshStandardMaterial({ color: 0x6B4E31 });
    const openDesk = new THREE.Mesh(deskGeometry, deskMaterial);
    openDesk.position.set(-1, 0.4, officeDepth / 2 - 1); // Près de la façade avant
    officeGroup.add(openDesk);
    
    const chairGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    for (let i = 0; i < 3; i++) {
      const chair = new THREE.Mesh(chairGeometry, chairMaterial);
      chair.position.set(-1.5 + i * 1.5, 0.5, officeDepth / 2 - 2.5); // Face au bureau
      officeGroup.add(chair);
    }
    
    // Bureaux de gestion (près de l'entrée)
    const managerDeskGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const managerDesk1 = new THREE.Mesh(managerDeskGeometry, deskMaterial);
    managerDesk1.position.set(-officeWidth / 2 + 1, 0.4, -officeDepth / 2 + 1);
    officeGroup.add(managerDesk1);
    
    const managerChair1 = new THREE.Mesh(chairGeometry, chairMaterial);
    managerChair1.position.set(-officeWidth / 2 + 1, 0.5, -officeDepth / 2 + 2);
    officeGroup.add(managerChair1);
    
    const managerDesk2 = new THREE.Mesh(managerDeskGeometry, deskMaterial);
    managerDesk2.position.set(1, 0.4, -officeDepth / 2 + 1);
    officeGroup.add(managerDesk2);
    
    const managerChair2 = new THREE.Mesh(chairGeometry, chairMaterial);
    managerChair2.position.set(1, 0.5, -officeDepth / 2 + 2);
    officeGroup.add(managerChair2);
    
    officeGroup.position.set(0, 0.1, 0);
    scene.add(officeGroup);
    
    // Configuration pour visite virtuelle
    camera.position.set(-officeWidth / 2 + doorWidth / 2, 1.5, -officeDepth / 2 + 0.5); // Près de la porte d'entrée
    controls.target.set(0, 1.5, 0); // Regarder vers le centre
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.enabled = true;
    controls.update();
  }

  const officeButton = document.getElementById('officeButton');
  officeButton.addEventListener('click', () => {
    createOffice();
    officeButton.textContent = officeGroup ? 'Retour au bâtiment' : 'Visiter le bureau';
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
