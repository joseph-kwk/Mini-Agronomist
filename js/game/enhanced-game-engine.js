// Farm Genius - Enhanced Immersive 3D Farming Game Engine
// Complete realistic farming simulation with educational integration

class FarmGameEngine {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    
    // Game state
    this.gameTime = {
      day: 1,
      hour: 8, // Start at 8 AM
      season: 'spring',
      year: 1,
      weather: 'sunny'
    };
    
    this.playerStats = {
      money: 5000,
      experience: 0,
      level: 1,
      cropsPlanted: 0,
      cropsHarvested: 0
    };
    
    // Educational tracking
    this.learningProgress = {
      conceptsLearned: [],
      quizzesPassed: 0,
      decisionsCorrect: 0,
      decisionsTotal: 0
    };
    
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLighting();
    this.initEnvironment();
    this.initTractor();
    this.initCropSystem();
    this.initWeatherSystem();
    this.initControls();
    this.initPhysics();
    
    console.log('✅ Enhanced Farm Game Engine initialized!');
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
  }
  
  initCamera() {
    // Third-person follow camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 8, 15);
    this.cameraTarget = new THREE.Vector3();
  }
  
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  
  initLighting() {
    // Ambient light (general illumination)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);
    
    // Sun (directional light)
    this.sunLight = new THREE.DirectionalLight(0xFFF8DC, 1.0);
    this.sunLight.position.set(50, 50, 50);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 200;
    this.sunLight.shadow.camera.left = -50;
    this.sunLight.shadow.camera.right = 50;
    this.sunLight.shadow.camera.top = 50;
    this.sunLight.shadow.camera.bottom = -50;
    this.scene.add(this.sunLight);
    
    // Hemisphere light (sky lighting)
    this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x4CAF50, 0.5);
    this.scene.add(this.hemisphereLight);
  }
  
  initEnvironment() {
    // Large ground plane (farm land)
    const groundSize = 200;
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50);
    
    // Add slight terrain variation
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.random() * 0.3 - 0.15; // Slight height variation
    }
    groundGeometry.attributes.position.needsUpdate = true;
    groundGeometry.computeVertexNormals();
    
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x4CAF50,
      roughness: 0.9,
      metalness: 0.1
    });
    
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
    
    // Create farming field (plowed area)
    this.createFarmField();
    
    // Add environmental elements
    this.createSky();
    this.createTrees();
    this.createFences();
    this.createBarn();
    
    // Add animated grass
    this.createGrass();
  }
  
  createSky() {
    // Dynamic sky with moving clouds
    const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    
    this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
    this.scene.add(this.sky);
    
    // Clouds
    this.clouds = new THREE.Group();
    this.createClouds();
    this.scene.add(this.clouds);
  }
  
  createClouds() {
    const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    
    for (let i = 0; i < 20; i++) {
      const cloudGroup = new THREE.Group();
      
      // Create puffy cloud from multiple spheres
      for (let j = 0; j < 5; j++) {
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 1,
          (Math.random() - 0.5) * 3
        );
        cloud.scale.set(
          1 + Math.random() * 2,
          0.5 + Math.random() * 0.5,
          1 + Math.random() * 2
        );
        cloudGroup.add(cloud);
      }
      
      cloudGroup.position.set(
        (Math.random() - 0.5) * 150,
        30 + Math.random() * 20,
        (Math.random() - 0.5) * 150
      );
      
      cloudGroup.userData = {
        speed: 0.5 + Math.random() * 0.5
      };
      
      this.clouds.add(cloudGroup);
    }
  }
  
  createFarmField() {
    // Main farming area (grid of plots)
    this.farmField = new THREE.Group();
    this.plots = [];
    
    const plotSize = 4;
    const plotsPerRow = 5;
    const gap = 0.5;
    
    for (let row = 0; row < plotsPerRow; row++) {
      for (let col = 0; col < plotsPerRow; col++) {
        const x = (col - plotsPerRow / 2) * (plotSize + gap);
        const z = (row - plotsPerRow / 2) * (plotSize + gap);
        
        // Soil plot
        const plotGeometry = new THREE.BoxGeometry(plotSize, 0.3, plotSize);
        const plotMaterial = new THREE.MeshStandardMaterial({
          color: 0x6D4C41,
          roughness: 0.9,
          metalness: 0.1
        });
        
        const plot = new THREE.Mesh(plotGeometry, plotMaterial);
        plot.position.set(x, 0.15, z);
        plot.castShadow = true;
        plot.receiveShadow = true;
        
        plot.userData = {
          type: 'plot',
          state: 'unplowed', // unplowed, plowed, planted, growing, mature, harvested
          crop: null,
          soilQuality: 80,
          moisture: 50,
          nutrients: { N: 60, P: 50, K: 55 },
          plotId: row * plotsPerRow + col,
          dayPlanted: null,
          growthStage: 0
        };
        
        this.farmField.add(plot);
        this.plots.push(plot);
      }
    }
    
    this.scene.add(this.farmField);
  }
  
  createTrees() {
    // Surrounding trees for atmosphere
    const treeGroup = new THREE.Group();
    
    for (let i = 0; i < 15; i++) {
      const tree = this.createSingleTree();
      
      // Position trees around perimeter
      const angle = (i / 15) * Math.PI * 2;
      const distance = 40 + Math.random() * 20;
      tree.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );
      
      treeGroup.add(tree);
    }
    
    this.scene.add(treeGroup);
    this.trees = treeGroup;
  }
  
  createSingleTree() {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4E342E });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Foliage (cone)
    const foliageGeometry = new THREE.ConeGeometry(2, 5, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 5.5;
    foliage.castShadow = true;
    tree.add(foliage);
    
    // Store original scale for wind animation
    foliage.userData.originalScale = foliage.scale.clone();
    
    return tree;
  }
  
  createFences() {
    // Simple fence around field perimeter
    const fenceGroup = new THREE.Group();
    const fenceColor = 0x8B4513;
    
    const postGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.2);
    const postMaterial = new THREE.MeshStandardMaterial({ color: fenceColor });
    
    const perimeter = 30;
    const postSpacing = 3;
    
    // Four sides
    for (let side = 0; side < 4; side++) {
      const isVertical = side % 2 === 0;
      
      for (let i = 0; i < perimeter / postSpacing; i++) {
        const post = new THREE.Mesh(postGeometry, postMaterial);
        
        if (isVertical) {
          post.position.set(
            side === 0 ? perimeter / 2 : -perimeter / 2,
            0.75,
            -perimeter / 2 + i * postSpacing
          );
        } else {
          post.position.set(
            -perimeter / 2 + i * postSpacing,
            0.75,
            side === 1 ? perimeter / 2 : -perimeter / 2
          );
        }
        
        post.castShadow = true;
        fenceGroup.add(post);
      }
    }
    
    this.scene.add(fenceGroup);
  }
  
  createBarn() {
    // Simple barn structure
    const barn = new THREE.Group();
    
    // Main structure
    const barnGeometry = new THREE.BoxGeometry(8, 5, 6);
    const barnMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const barnMesh = new THREE.Mesh(barnGeometry, barnMaterial);
    barnMesh.position.y = 2.5;
    barnMesh.castShadow = true;
    barnMesh.receiveShadow = true;
    barn.add(barnMesh);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(6, 3, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x4E342E });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 6.5;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    barn.add(roof);
    
    // Position barn off to the side
    barn.position.set(-25, 0, -25);
    
    this.scene.add(barn);
  }
  
  createGrass() {
    // Animated grass patches around field
    const grassGroup = new THREE.Group();
    const grassGeometry = new THREE.PlaneGeometry(0.5, 1);
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x4CAF50,
      side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 100; i++) {
      const grass = new THREE.Mesh(grassGeometry, grassMaterial);
      
      // Random position around field
      const angle = Math.random() * Math.PI * 2;
      const distance = 18 + Math.random() * 15;
      grass.position.set(
        Math.cos(angle) * distance,
        0.5,
        Math.sin(angle) * distance
      );
      
      grass.rotation.y = Math.random() * Math.PI * 2;
      grass.userData.swayPhase = Math.random() * Math.PI * 2;
      grass.userData.swaySpeed = 0.5 + Math.random() * 0.5;
      
      grassGroup.add(grass);
    }
    
    this.scene.add(grassGroup);
    this.grassGroup = grassGroup;
  }
  
  initTractor() {
    // Create drivable tractor
    this.tractor = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    this.tractor.add(body);
    
    // Cabin
    const cabinGeometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.y = 2.5;
    cabin.position.z = -0.3;
    cabin.castShadow = true;
    this.tractor.add(cabin);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.3, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1A1A1A });
    
    const wheelPositions = [
      { x: -1.1, y: 0.6, z: 1 },
      { x: 1.1, y: 0.6, z: 1 },
      { x: -1.1, y: 0.6, z: -1 },
      { x: 1.1, y: 0.6, z: -1 }
    ];
    
    this.tractorWheels = [];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      this.tractor.add(wheel);
      this.tractorWheels.push(wheel);
    });
    
    // Position tractor at start
    this.tractor.position.set(-10, 0, -10);
    this.tractor.userData = {
      speed: 0,
      maxSpeed: 8,
      acceleration: 3,
      turnSpeed: 2,
      fuel: 100
    };
    
    this.scene.add(this.tractor);
  }
  
  initCropSystem() {
    this.cropInstances = new Map(); // plotId -> crop mesh
  }
  
  initWeatherSystem() {
    this.weather = {
      current: 'sunny',
      temperature: 24,
      humidity: 60,
      windSpeed: 2,
      rainfall: 0,
      forecast: []
    };
    
    // Rain particle system
    this.rainParticles = null;
    this.createRainSystem();
  }
  
  createRainSystem() {
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const rainMaterial = new THREE.PointsMaterial({
      color: 0xaaaaff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    this.rainParticles = new THREE.Points(particles, rainMaterial);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }
  
  initControls() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      this.keysPressed[e.key.toLowerCase()] = true;
      
      // Educational prompts on first actions
      if (e.key === 'p' && !this.learningProgress.conceptsLearned.includes('plowing')) {
        this.showEducationalTip('plowing', 'Plowing loosens soil and prepares it for planting. This improves root penetration and water infiltration!');
        this.learningProgress.conceptsLearned.push('plowing');
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keysPressed[e.key.toLowerCase()] = false;
    });
    
    // Mouse controls for plot selection
    this.canvas.addEventListener('click', (e) => this.onPlotClick(e));
  }
  
  initPhysics() {
    // Simple physics (no external library)
    this.gravity = -9.8;
  }
  
  // ==========================================
  // GAME LOOP & UPDATES
  // ==========================================
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.deltaTime = this.clock.getDelta();
    
    this.updateTractor();
    this.updateCamera();
    this.updateEnvironment();
    this.updateWeather();
    this.updateCrops();
    this.updateTime();
    
    this.renderer.render(this.scene, this.camera);
  }
  
  updateTractor() {
    if (!this.tractor) return;
    
    const userData = this.tractor.userData;
    let isMoving = false;
    
    // WASD controls
    if (this.keysPressed['w']) {
      userData.speed = Math.min(userData.speed + userData.acceleration * this.deltaTime, userData.maxSpeed);
      isMoving = true;
    }
    if (this.keysPressed['s']) {
      userData.speed = Math.max(userData.speed - userData.acceleration * this.deltaTime, -userData.maxSpeed / 2);
      isMoving = true;
    }
    if (this.keysPressed['a']) {
      this.tractor.rotation.y += userData.turnSpeed * this.deltaTime;
    }
    if (this.keysPressed['d']) {
      this.tractor.rotation.y -= userData.turnSpeed * this.deltaTime;
    }
    
    // Apply friction
    if (!isMoving) {
      userData.speed *= 0.95;
    }
    
    // Move tractor
    if (Math.abs(userData.speed) > 0.01) {
      const moveX = Math.sin(this.tractor.rotation.y) * userData.speed * this.deltaTime;
      const moveZ = Math.cos(this.tractor.rotation.y) * userData.speed * this.deltaTime;
      
      this.tractor.position.x += moveX;
      this.tractor.position.z += moveZ;
      
      // Rotate wheels
      this.tractorWheels.forEach(wheel => {
        wheel.rotation.x += userData.speed * this.deltaTime * 0.5;
      });
      
      // Boundary check
      const maxDist = 45;
      if (Math.abs(this.tractor.position.x) > maxDist) {
        this.tractor.position.x = Math.sign(this.tractor.position.x) * maxDist;
        userData.speed = 0;
      }
      if (Math.abs(this.tractor.position.z) > maxDist) {
        this.tractor.position.z = Math.sign(this.tractor.position.z) * maxDist;
        userData.speed = 0;
      }
    }
  }
  
  updateCamera() {
    // Follow tractor (third-person)
    if (!this.tractor) return;
    
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(this.tractor.position);
    
    // Camera behind and above tractor
    const offset = new THREE.Vector3(0, 6, 12);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.tractor.rotation.y);
    targetPosition.add(offset);
    
    // Smooth camera movement
    this.camera.position.lerp(targetPosition, 0.1);
    
    // Look at tractor
    this.cameraTarget.copy(this.tractor.position);
    this.cameraTarget.y += 2;
    this.camera.lookAt(this.cameraTarget);
  }
  
  updateEnvironment() {
    // Animate clouds
    if (this.clouds) {
      this.clouds.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed * this.deltaTime;
        
        // Wrap around
        if (cloud.position.x > 80) {
          cloud.position.x = -80;
        }
      });
    }
    
    // Animate grass (sway in wind)
    if (this.grassGroup) {
      this.grassGroup.children.forEach(grass => {
        const time = this.clock.getElapsedTime();
        const sway = Math.sin(time * grass.userData.swaySpeed + grass.userData.swayPhase) * 0.1;
        grass.rotation.z = sway;
      });
    }
    
    // Animate tree leaves (wind effect)
    if (this.trees) {
      this.trees.children.forEach(tree => {
        const foliage = tree.children[1]; // Second child is foliage
        if (foliage && foliage.userData.originalScale) {
          const time = this.clock.getElapsedTime();
          const sway = Math.sin(time * 0.5) * 0.05;
          foliage.rotation.z = sway;
        }
      });
    }
  }
  
  updateWeather() {
    // Dynamic weather changes
    if (this.weather.current === 'rainy' && this.rainParticles) {
      this.rainParticles.visible = true;
      
      // Animate rain
      const positions = this.rainParticles.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 20 * this.deltaTime;
        
        // Reset rain particles that hit ground
        if (positions[i + 1] < 0) {
          positions[i + 1] = 50;
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    } else if (this.rainParticles) {
      this.rainParticles.visible = false;
    }
  }
  
  updateCrops() {
    // Update crop growth visual stages
    this.cropInstances.forEach((crop, plotId) => {
      const plot = this.plots[plotId];
      if (!plot || !plot.userData.crop) return;
      
      const daysGrown = this.gameTime.day - plot.userData.dayPlanted;
      const cropData = plot.userData.crop;
      const growthProgress = daysGrown / cropData.daysToMaturity;
      
      // Update crop appearance based on growth stage
      if (growthProgress < 0.2) {
        // Seedling
        crop.scale.y = growthProgress * 5;
        crop.material.color.setHex(0x90EE90); // Light green
      } else if (growthProgress < 0.6) {
        // Vegetative growth
        crop.scale.y = 0.5 + growthProgress * 0.5;
        crop.material.color.setHex(0x4CAF50); // Green
      } else if (growthProgress < 0.9) {
        // Flowering/maturation
        crop.scale.y = 1;
        crop.material.color.setHex(0x8BC34A); // Yellow-green
      } else {
        // Mature/ready
        crop.material.color.setHex(0xFFD700); // Golden
      }
    });
  }
  
  updateTime() {
    // Advance time slowly (1 game minute = 1 real second)
    this.gameTime.hour += this.deltaTime / 60;
    
    if (this.gameTime.hour >= 24) {
      this.gameTime.hour = 0;
      this.gameTime.day++;
      this.onNewDay();
    }
    
    // Update sun position based on time
    const hourAngle = (this.gameTime.hour / 24) * Math.PI * 2 - Math.PI / 2;
    this.sunLight.position.x = Math.cos(hourAngle) * 50;
    this.sunLight.position.y = Math.sin(hourAngle) * 50 + 10;
    
    // Adjust lighting based on time of day
    const sunHeight = this.sunLight.position.y;
    const intensity = Math.max(0.3, Math.min(1.0, sunHeight / 50));
    this.sunLight.intensity = intensity;
    
    // Change sky color
    if (sunHeight < 20) {
      // Sunset/sunrise
      this.scene.background.setHex(0xFF7F50);
      this.scene.fog.color.setHex(0xFF7F50);
    } else {
      // Daytime
      this.scene.background.setHex(0x87CEEB);
      this.scene.fog.color.setHex(0x87CEEB);
    }
  }
  
  onNewDay() {
    console.log(`🌅 New day: Day ${this.gameTime.day}`);
    
    // Update all plots
    this.plots.forEach(plot => {
      if (plot.userData.state === 'planted' || plot.userData.state === 'growing') {
        // Reduce moisture
        plot.userData.moisture = Math.max(0, plot.userData.moisture - 5);
        
        // Check if crop needs water
        if (plot.userData.moisture < 30) {
          this.showEducationalTip('watering', 'Your crops need water! Low soil moisture can reduce yield by 50%. Rain or irrigation is needed.');
        }
      }
    });
    
    // Random weather change
    if (Math.random() < 0.2) {
      this.changeWeather();
    }
  }
  
  changeWeather() {
    const weathers = ['sunny', 'cloudy', 'rainy'];
    const oldWeather = this.weather.current;
    this.weather.current = weathers[Math.floor(Math.random() * weathers.length)];
    
    if (this.weather.current === 'rainy' && oldWeather !== 'rainy') {
      this.showEducationalTip('rain', `It's raining! Your crops will receive natural irrigation. Rainfall replenishes soil moisture.`);
      
      // Add moisture to all plots
      this.plots.forEach(plot => {
        plot.userData.moisture = Math.min(100, plot.userData.moisture + 30);
      });
    }
    
    console.log(`🌦️ Weather changed to ${this.weather.current}`);
  }
  
  // ==========================================
  // FARMING ACTIONS
  // ==========================================
  
  plowPlot(plot) {
    if (plot.userData.state !== 'unplowed') {
      this.showMessage('This plot is already plowed!', 'warning');
      return false;
    }
    
    plot.userData.state = 'plowed';
    plot.material.color.setHex(0x5D4037); // Darker soil
    
    this.showMessage('Plot plowed! Ready for planting.', 'success');
    this.showEducationalTip('plowing', 'Plowing breaks up compacted soil, improves aeration, and makes it easier for roots to grow deep!');
    
    return true;
  }
  
  sowSeeds(plot, cropType = 'maize') {
    if (plot.userData.state !== 'plowed') {
      this.showMessage('Plow the plot first!', 'warning');
      return false;
    }
    
    if (this.playerStats.money < 100) {
      this.showMessage('Not enough money! (Need $100 for seeds)', 'error');
      return false;
    }
    
    this.playerStats.money -= 100;
    
    // Get crop data from Mini Agronomist
    const cropProfiles = window.miniAgronomist?.cropProfiles || {};
    const cropData = cropProfiles[cropType] || {
      days_to_maturity: [90, 120],
      water_requirement_mm: [450, 900],
      optimal_temp_c: [18, 30]
    };
    
    // Create crop visual
    const cropGeometry = new THREE.ConeGeometry(0.4, 2, 8);
    const cropMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90 });
    const crop = new THREE.Mesh(cropGeometry, cropMaterial);
    crop.position.copy(plot.position);
    crop.position.y = 1;
    crop.castShadow = true;
    crop.scale.y = 0.1; // Start small
    this.scene.add(crop);
    
    plot.userData.state = 'planted';
    plot.userData.crop = {
      type: cropType,
      name: cropType.charAt(0).toUpperCase() + cropType.slice(1),
      daysToMaturity: cropData.days_to_maturity[0],
      waterNeeds: cropData.water_requirement_mm[0],
      optimalTemp: cropData.optimal_temp_c
    };
    plot.userData.dayPlanted = this.gameTime.day;
    plot.userData.growthStage = 0;
    
    this.cropInstances.set(plot.userData.plotId, crop);
    this.playerStats.cropsPlanted++;
    
    this.showMessage(`${plot.userData.crop.name} seeds sown! 🌱`, 'success');
    this.showEducationalTip('sowing', `You planted ${plot.userData.crop.name}! It needs ${Math.round(cropData.water_requirement_mm[0])}mm of water over its ${cropData.days_to_maturity[0]}-day growing season.`);
    
    return true;
  }
  
  waterPlot(plot) {
    if (plot.userData.state !== 'planted' && plot.userData.state !== 'growing') {
      this.showMessage('No crops to water here!', 'warning');
      return false;
    }
    
    plot.userData.moisture = Math.min(100, plot.userData.moisture + 20);
    
    this.showMessage('Plot watered! 💧', 'success');
    
    if (!this.learningProgress.conceptsLearned.includes('watering')) {
      this.showEducationalTip('watering', 'Proper watering is crucial! Too little causes drought stress, too much can cause root rot and nutrient leaching.');
      this.learningProgress.conceptsLearned.push('watering');
    }
    
    return true;
  }
  
  harvestCrop(plot) {
    if (!plot.userData.crop) {
      this.showMessage('Nothing to harvest!', 'warning');
      return false;
    }
    
    const daysGrown = this.gameTime.day - plot.userData.dayPlanted;
    const cropData = plot.userData.crop;
    
    if (daysGrown < cropData.daysToMaturity) {
      this.showMessage(`Not ready yet! ${cropData.daysToMaturity - daysGrown} days remaining.`, 'warning');
      return false;
    }
    
    // Calculate yield based on conditions
    const moistureFactor = plot.userData.moisture / 100;
    const soilFactor = plot.userData.soilQuality / 100;
    const baseYield = 4.5; // tons per hectare
    const actualYield = baseYield * moistureFactor * soilFactor;
    
    const revenue = Math.round(actualYield * 200); // $200 per ton
    this.playerStats.money += revenue;
    this.playerStats.cropsHarvested++;
    this.playerStats.experience += 50;
    
    // Remove crop visual
    const crop = this.cropInstances.get(plot.userData.plotId);
    if (crop) {
      this.scene.remove(crop);
      this.cropInstances.delete(plot.userData.plotId);
    }
    
    // Reset plot
    plot.userData.state = 'harvested';
    plot.userData.crop = null;
    plot.userData.dayPlanted = null;
    plot.material.color.setHex(0x8D6E63);
    
    this.showMessage(`Harvested! Earned $${revenue} 🌾`, 'success');
    this.showEducationalTip('harvest', `You harvested ${actualYield.toFixed(1)} tons/ha! Soil moisture: ${plot.userData.moisture}% (optimal: 60-80%). Soil quality: ${plot.userData.soilQuality}%.`);
    
    return true;
  }
  
  // ==========================================
  // EDUCATIONAL SYSTEM
  // ==========================================
  
  showEducationalTip(concept, message) {
    console.log(`📚 ${concept}: ${message}`);
    
    // Create educational overlay
    const tipDiv = document.createElement('div');
    tipDiv.className = 'educational-tip';
    tipDiv.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(46, 125, 50, 0.95);
      color: white;
      padding: 1rem 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 500px;
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    `;
    tipDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <span class="material-icons" style="font-size: 2rem;">school</span>
        <div>
          <strong style="display: block; margin-bottom: 0.5rem;">${this.capitalizeFirst(concept)}</strong>
          <p style="margin: 0;">${message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(tipDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
      tipDiv.style.animation = 'slideDown 0.3s ease-out';
      setTimeout(() => tipDiv.remove(), 300);
    }, 5000);
  }
  
  showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Update HUD or show toast notification
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  // ==========================================
  // PLOT INTERACTION
  // ==========================================
  
  onPlotClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    
    const intersects = raycaster.intersectObjects(this.plots);
    
    if (intersects.length > 0) {
      const plot = intersects[0].object;
      this.showPlotInfo(plot);
    }
  }
  
  showPlotInfo(plot) {
    const infoPanel = document.getElementById('infoPanel');
    const plotInfo = document.getElementById('plotInfo');
    
    if (!infoPanel || !plotInfo) return;
    
    infoPanel.style.display = 'block';
    
    let html = `<p><strong>Plot ${plot.userData.plotId + 1}</strong></p>`;
    html += `<p>State: ${plot.userData.state}</p>`;
    html += `<p>Soil Quality: ${plot.userData.soilQuality}%</p>`;
    html += `<p>Moisture: ${plot.userData.moisture}%</p>`;
    
    if (plot.userData.crop) {
      const daysGrown = this.gameTime.day - plot.userData.dayPlanted;
      const progress = Math.min(100, (daysGrown / plot.userData.crop.daysToMaturity) * 100);
      
      html += `<hr style="margin: 1rem 0;">`;
      html += `<p><strong>Crop: ${plot.userData.crop.name}</strong></p>`;
      html += `<p>Day ${daysGrown} of ${plot.userData.crop.daysToMaturity}</p>`;
      html += `<p>Progress: ${progress.toFixed(0)}%</p>`;
      html += `<div style="background: #ddd; height: 10px; border-radius: 5px; margin: 0.5rem 0;">`;
      html += `<div style="background: #4CAF50; height: 100%; width: ${progress}%; border-radius: 5px;"></div>`;
      html += `</div>`;
      
      if (progress >= 100) {
        html += `<button onclick="game.harvestCrop(game.plots[${plot.userData.plotId}])" class="game-btn" style="width: 100%; margin-top: 0.5rem;">`;
        html += `<span class="material-icons">agriculture</span> Harvest</button>`;
      }
    }
    
    plotInfo.innerHTML = html;
  }
  
  // ==========================================
  // UTILITY
  // ==========================================
  
  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  start() {
    this.animate();
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.FarmGameEngine = FarmGameEngine;
}
