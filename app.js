const THREE = window.THREE;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYQWb8dEno__POur0UABfi0F9JR4i_XQw",
  authDomain: "dive-travel-9dcf7.firebaseapp.com",
  projectId: "dive-travel-9dcf7",
  storageBucket: "dive-travel-9dcf7.firebasestorage.app",
  messagingSenderId: "996020953462",
  appId: "1:996020953462:web:81c9bf7db384321c335a57",
  measurementId: "G-W724QN8LBY"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  const analytics = firebase.analytics();
  const storage = firebase.storage();
  console.log('Firebase initialized successfully');
  
  // Firebase Storage 예시 함수
  async function uploadToFirebase(file, fileName) {
    try {
      const storageRef = storage.ref(`assets/${fileName}`);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();
      console.log('File uploaded to Firebase Storage:', url);
      return url;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw error;
    }
  }
  
  // 전역 함수로 등록
  window.uploadToFirebase = uploadToFirebase;
  
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Scene, Camera, Renderer 설정
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF); // 실내 느낌의 흰색 배경

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById('container').appendChild(renderer.domElement);

// 조명 설정 (편의점 스타일 밝은 조명)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 25, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 천장에 밝은 형광등(LED 백색광) 격자 패턴 추가
function createCeilingLight(x, z) {
    const lightGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
    const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        emissive: 0xFFFFFF,
        emissiveIntensity: 0.8
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.set(x, 7.9, z);
    
    // 실제 조명 추가
    const pointLight = new THREE.PointLight(0xFFFFFF, 0.5, 10);
    pointLight.position.set(x, 7.5, z);
    scene.add(pointLight);
    
    return light;
}

// 천장에 형광등 격자 배치
for (let x = -18; x <= 18; x += 6) {
    for (let z = -18; z <= 18; z += 6) {
        scene.add(createCeilingLight(x, z));
    }
}

// 바닥 생성 (빛을 반사하는 밝은 회색 타일)
const floorSize = 50;
const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);

// 타일 패턴 생성을 위한 캔버스 텍스처
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

// 밝은 회색 배경
ctx.fillStyle = '#D3D3D3';
ctx.fillRect(0, 0, 512, 512);

// 타일 격자무늬
ctx.strokeStyle = '#C0C0C0';
ctx.lineWidth = 2;
const tileSize = 64;

for (let i = 0; i <= 512; i += tileSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
}

const floorTexture = new THREE.CanvasTexture(canvas);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(8, 8);

const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture,
    roughness: 0.2,    // 더 매끄러운 표면
    metalness: 0.3      // 빛 반사 증가
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 벽 생성 함수
function createWall(width, height, x, y, z, rotationY = 0) {
    const wallGeometry = new THREE.BoxGeometry(width, height, 0.3);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xF5F5F5,
        roughness: 0.8
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, y, z);
    wall.rotation.y = rotationY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    return wall;
}

// 마트 벽들 (사방)
const wallHeight = 8;
const martSize = 25;

// 앞쪽 벽 (입구 반대편)
scene.add(createWall(martSize * 2, wallHeight, 0, wallHeight / 2, -martSize));

// 뒤쪽 벽 (입구 쪽 - 입구 공간 남김)
scene.add(createWall(martSize * 2, wallHeight, 0, wallHeight / 2, martSize));

// 왼쪽 벽
scene.add(createWall(martSize * 2, wallHeight, -martSize, wallHeight / 2, 0, Math.PI / 2));

// 오른쪽 벽
scene.add(createWall(martSize * 2, wallHeight, martSize, wallHeight / 2, 0, Math.PI / 2));

// 천장 생성
const ceilingGeometry = new THREE.PlaneGeometry(martSize * 2, martSize * 2);
const ceilingMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFAFAFA,
    roughness: 0.9,
    side: THREE.DoubleSide
});
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = wallHeight;
ceiling.receiveShadow = true;
scene.add(ceiling);

// 상품 색상 배열
const productColors = [
    0xFF0000, // 빨간색
    0x0000FF, // 파란색
    0x00FF00, // 초록색
    0xFFFF00, // 노란색
    0xFF00FF, // 마젠타
    0x00FFFF, // 시안
    0xFFA500, // 주황색
    0x800080, // 보라색
    0xFFC0CB, // 분홍색
    0x8B4513  // 갈색
];

// 브랜드 라벨 텍스처 생성
function createBrandLabelTexture(brandName, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // 배경색
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 128, 64);
    
    // 브랜드 이름
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandName, 64, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// 브랜드 이름들
const brandNames = ['Coke', 'Pepsi', 'Sprite', 'Fanta', 'Milk', 'Coffee', 'Tea', 'Juice'];

// 상품 형태 생성 함수들
function createCanDrink() {
    const canGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 16);
    const randomColor = productColors[Math.floor(Math.random() * productColors.length)];
    const brandName = brandNames[Math.floor(Math.random() * brandNames.length)];
    
    const labelTexture = createBrandLabelTexture(brandName, '#' + randomColor.toString(16).padStart(6, '0'));
    
    const canMaterial = new THREE.MeshStandardMaterial({ 
        color: randomColor,
        metalness: 0.7,
        roughness: 0.3,
        map: labelTexture
    });
    const can = new THREE.Mesh(canGeometry, canMaterial);
    can.castShadow = true;
    return can;
}

function createCupNoodle() {
    const cupGroup = new THREE.Group();
    
    const noodleBrands = ['Shin', 'Nong', 'Jin', 'Ottogi', 'Samyang'];
    const brandName = noodleBrands[Math.floor(Math.random() * noodleBrands.length)];
    const labelTexture = createBrandLabelTexture(brandName, '#FF6B6B');
    
    // 컵 본체
    const cupGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.4, 16);
    const cupMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF6B6B,
        roughness: 0.6,
        map: labelTexture
    });
    const cup = new THREE.Mesh(cupGeometry, cupMaterial);
    cup.castShadow = true;
    cupGroup.add(cup);
    
    // 뚜껑
    const lidGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
    const lidMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        metalness: 0.5,
        roughness: 0.3
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 0.2;
    lid.castShadow = true;
    cupGroup.add(lid);
    
    return cupGroup;
}

function createSnackBag() {
    const bagGeometry = new THREE.BoxGeometry(0.35, 0.5, 0.15);
    const randomColor = productColors[Math.floor(Math.random() * productColors.length)];
    const snackBrands = ['Lays', 'Pringles', 'Cheetos', 'Doritos', 'Oreo'];
    const brandName = snackBrands[Math.floor(Math.random() * snackBrands.length)];
    const labelTexture = createBrandLabelTexture(brandName, '#' + randomColor.toString(16).padStart(6, '0'));
    
    const bagMaterial = new THREE.MeshStandardMaterial({ 
        color: randomColor,
        roughness: 0.8,
        map: labelTexture
    });
    const bag = new THREE.Mesh(bagGeometry, bagMaterial);
    bag.castShadow = true;
    return bag;
}

// 상품 아이템들을 저장할 배열
const productItems = [];

// 곤돌라 선반 생성 (양면 진열 낮은 선반)
function createGondolaShelf(x, z, rotation = 0) {
    const gondolaGroup = new THREE.Group();
    
    // 선반 프레임 (강철)
    const frameGeometry = new THREE.BoxGeometry(4, 1.2, 1.5);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x708090, // 강철 회색
        metalness: 0.8,
        roughness: 0.2
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 0.6;
    frame.castShadow = true;
    frame.receiveShadow = true;
    gondolaGroup.add(frame);
    
    // 양면 선반 레벨들
    for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 2; i++) {
            const shelfGeometry = new THREE.BoxGeometry(3.8, 0.08, 0.6);
            const shelfMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xD3D3D3,
                metalness: 0.5,
                roughness: 0.3
            });
            const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
            shelf.position.set(0, 0.25 + i * 0.4, side * 0.3);
            shelf.receiveShadow = true;
            gondolaGroup.add(shelf);
            
            // 상품들 (다양한 형태)
            for (let j = 0; j < 5; j++) {
                let product;
                const productType = Math.floor(Math.random() * 3);
                
                if (productType === 0) {
                    product = createCanDrink();
                } else if (productType === 1) {
                    product = createCupNoodle();
                } else {
                    product = createSnackBag();
                }
                
                product.position.set(-1.5 + j * 0.7, 0.55 + i * 0.4, side * 0.3);
                
                productItems.push(product);
                gondolaGroup.add(product);
            }
        }
    }
    
    gondolaGroup.position.set(x, 0, z);
    gondolaGroup.rotation.y = rotation;
    return gondolaGroup;
}

// 마트 선반들 생성
function createShelf(x, z, rotation = 0) {
    const shelfGroup = new THREE.Group();
    
    // 선반 몸체
    const shelfGeometry = new THREE.BoxGeometry(3, 2, 0.8);
    const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.y = 1;
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);
    
    // 선반 레벨들
    for (let i = 0; i < 3; i++) {
        const levelGeometry = new THREE.BoxGeometry(2.8, 0.1, 0.7);
        const levelMaterial = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const level = new THREE.Mesh(levelGeometry, levelMaterial);
        level.position.y = 0.3 + i * 0.6;
        level.receiveShadow = true;
        shelfGroup.add(level);
        
        // 상품들 (다양한 형태)
        for (let j = 0; j < 4; j++) {
            let product;
            const productType = Math.floor(Math.random() * 3);
            
            if (productType === 0) {
                product = createCanDrink();
            } else if (productType === 1) {
                product = createCupNoodle();
            } else {
                product = createSnackBag();
            }
            
            product.position.set(-1 + j * 0.6, 0.55 + i * 0.6, 0);
            
            // 상품 아이템으로 저장
            productItems.push(product);
            
            shelfGroup.add(product);
        }
    }
    
    shelfGroup.position.set(x, 0, z);
    shelfGroup.rotation.y = rotation;
    return shelfGroup;
}

// 마트 공간에 선반 배치 (실내 공간에 맞게 조정)
// 왼쪽 벽면 선반들
scene.add(createShelf(-18, -10, 0));
scene.add(createShelf(-18, -5, 0));
scene.add(createShelf(-18, 0, 0));
scene.add(createShelf(-18, 5, 0));
scene.add(createShelf(-18, 10, 0));

// 오른쪽 벽면 선반들
scene.add(createShelf(18, -10, 0));
scene.add(createShelf(18, -5, 0));
scene.add(createShelf(18, 0, 0));
scene.add(createShelf(18, 5, 0));
scene.add(createShelf(18, 10, 0));

// 위쪽 벽면 선반들
scene.add(createShelf(-10, -18, Math.PI / 2));
scene.add(createShelf(0, -18, Math.PI / 2));
scene.add(createShelf(10, -18, Math.PI / 2));

// 아래쪽 벽면 선반들
scene.add(createShelf(-10, 18, Math.PI / 2));
scene.add(createShelf(0, 18, Math.PI / 2));
scene.add(createShelf(10, 18, Math.PI / 2));

// 자동 유리문 (입구)
function createAutomaticDoor() {
    const doorGroup = new THREE.Group();
    
    // 문 프레임
    const frameGeometry = new THREE.BoxGeometry(6, 4, 0.3);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        metalness: 0.8,
        roughness: 0.2
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 2;
    frame.castShadow = true;
    doorGroup.add(frame);
    
    // 유리문 (왼쪽)
    const leftDoorGeometry = new THREE.BoxGeometry(2.8, 3.5, 0.1);
    const glassMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.4,
        metalness: 0.9,
        roughness: 0.1
    });
    const leftDoor = new THREE.Mesh(leftDoorGeometry, glassMaterial);
    leftDoor.position.set(-1.5, 2, 0.15);
    leftDoor.castShadow = true;
    doorGroup.add(leftDoor);
    
    // 유리문 (오른쪽)
    const rightDoor = new THREE.Mesh(leftDoorGeometry, glassMaterial);
    rightDoor.position.set(1.5, 2, 0.15);
    rightDoor.castShadow = true;
    doorGroup.add(rightDoor);
    
    // 센서 (상단)
    const sensorGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.2);
    const sensorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.5
    });
    const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
    sensor.position.set(0, 3.8, 0.2);
    doorGroup.add(sensor);
    
    return doorGroup;
}

const automaticDoor = createAutomaticDoor();
automaticDoor.position.set(0, 0, 22); // 입구 위치
scene.add(automaticDoor);

// 컵라면 섭취용 테이블과 의자
function createEatingArea() {
    const areaGroup = new THREE.Group();
    
    // 테이블
    const tableGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.3,
        metalness: 0.1
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = 0.4;
    table.castShadow = true;
    table.receiveShadow = true;
    areaGroup.add(table);
    
    // 테이블 다리
    const legGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const legPositions = [
        [-0.6, 0.4, -0.4],
        [0.6, 0.4, -0.4],
        [-0.6, 0.4, 0.4],
        [0.6, 0.4, 0.4]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        areaGroup.add(leg);
    });
    
    // 의자 2개
    function createChair(x, z, rotation) {
        const chairGroup = new THREE.Group();
        
        // 의자 좌석
        const seatGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.5);
        const seatMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xFF6B6B,
            roughness: 0.5
        });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = 0.45;
        seat.castShadow = true;
        chairGroup.add(seat);
        
        // 의자 등받이
        const backGeometry = new THREE.BoxGeometry(0.5, 0.6, 0.08);
        const back = new THREE.Mesh(backGeometry, seatMaterial);
        back.position.set(0, 0.75, -0.25);
        back.castShadow = true;
        chairGroup.add(back);
        
        // 의자 다리
        const chairLegGeometry = new THREE.BoxGeometry(0.05, 0.45, 0.05);
        const chairLegMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        const chairLegPositions = [
            [-0.2, 0.22, -0.2],
            [0.2, 0.22, -0.2],
            [-0.2, 0.22, 0.2],
            [0.2, 0.22, 0.2]
        ];
        
        chairLegPositions.forEach(pos => {
            const chairLeg = new THREE.Mesh(chairLegGeometry, chairLegMaterial);
            chairLeg.position.set(...pos);
            chairLeg.castShadow = true;
            chairGroup.add(chairLeg);
        });
        
        chairGroup.position.set(x, 0, z);
        chairGroup.rotation.y = rotation;
        return chairGroup;
    }
    
    areaGroup.add(createChair(-1, 0, 0));
    areaGroup.add(createChair(1, 0, Math.PI));
    
    return areaGroup;
}

const eatingArea = createEatingArea();
eatingArea.position.set(-18, 0, 18); // 구석에 배치
scene.add(eatingArea);

// 중앙 섬형 선반들
scene.add(createShelf(-6, -6, 0));
scene.add(createShelf(6, -6, 0));
scene.add(createShelf(-6, 6, 0));
scene.add(createShelf(6, 6, 0));

// 중앙에 곤돌라 선반 3열 배치 (양면 진열)
scene.add(createGondolaShelf(0, -8, 0));
scene.add(createGondolaShelf(0, 0, 0));
scene.add(createGondolaShelf(0, 8, 0));

// L자형 계산대 생성 (입구 옆)
function createLShapedCounter() {
    const counterGroup = new THREE.Group();
    
    // 계산대 재질
    const counterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2F4F4F,
        roughness: 0.5,
        metalness: 0.2
    });
    const counterTopMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.4
    });
    
    // 메인 계산대 (가로)
    const mainCounterGeometry = new THREE.BoxGeometry(6, 1.2, 2);
    const mainCounter = new THREE.Mesh(mainCounterGeometry, counterMaterial);
    mainCounter.position.set(0, 0.6, 0);
    mainCounter.castShadow = true;
    mainCounter.receiveShadow = true;
    counterGroup.add(mainCounter);
    
    const mainCounterTop = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.1, 2.2), counterTopMaterial);
    mainCounterTop.position.set(0, 1.25, 0);
    mainCounterTop.castShadow = true;
    counterGroup.add(mainCounterTop);
    
    // 세로 계산대 (L자형)
    const sideCounterGeometry = new THREE.BoxGeometry(2, 1.2, 4);
    const sideCounter = new THREE.Mesh(sideCounterGeometry, counterMaterial);
    sideCounter.position.set(4, 0.6, 1);
    sideCounter.castShadow = true;
    sideCounter.receiveShadow = true;
    counterGroup.add(sideCounter);
    
    const sideCounterTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 4.2), counterTopMaterial);
    sideCounterTop.position.set(4, 1.25, 1);
    sideCounterTop.castShadow = true;
    counterGroup.add(sideCounterTop);
    
    return counterGroup;
}

const lShapedCounter = createLShapedCounter();
lShapedCounter.position.set(15, 0, 15); // 입구 옆에 배치

// POS 시스템 (모니터 형태)
function createPOSSystem() {
    const posGroup = new THREE.Group();
    
    // 모니터 스탠드
    const standGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const standMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = 0.2;
    posGroup.add(stand);
    
    // 모니터 본체
    const monitorGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.1);
    const monitorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        metalness: 0.8,
        roughness: 0.2
    });
    const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
    monitor.position.y = 0.6;
    monitor.castShadow = true;
    posGroup.add(monitor);
    
    // 화면
    const screenGeometry = new THREE.BoxGeometry(1.0, 0.6, 0.05);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x4169E1,
        emissive: 0x4169E1,
        emissiveIntensity: 0.2
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 0.6, 0.05);
    posGroup.add(screen);
    
    return posGroup;
}

// 바코드 스캐너
function createBarcodeScanner() {
    const scannerGroup = new THREE.Group();
    
    // 스캐너 본체
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        metalness: 0.5,
        roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    scannerGroup.add(body);
    
    // 스캐너 헤드
    const headGeometry = new THREE.BoxGeometry(0.25, 0.1, 0.2);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 0.1, 0.2);
    head.castShadow = true;
    scannerGroup.add(head);
    
    // 레이저 빔 (발광 효과)
    const laserGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.3);
    const laserMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFF0000,
        emissive: 0xFF0000,
        emissiveIntensity: 0.8
    });
    const laser = new THREE.Mesh(laserGeometry, laserMaterial);
    laser.position.set(0, 0.15, 0.3);
    scannerGroup.add(laser);
    
    return scannerGroup;
}

// POS 시스템과 바코드 스캐너 배치
const posSystem = createPOSSystem();
posSystem.position.set(15, 1.25, 15);
lShapedCounter.add(posSystem);

const barcodeScanner = createBarcodeScanner();
barcodeScanner.position.set(16, 1.3, 15);
lShapedCounter.add(barcodeScanner);

scene.add(lShapedCounter);

// 담배 진열대 (계산대 뒤 벽)
function createCigaretteDisplay() {
    const displayGroup = new THREE.Group();
    
    // 진열대 프레임
    const frameGeometry = new THREE.BoxGeometry(8, 3, 0.5);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = 2;
    frame.castShadow = true;
    displayGroup.add(frame);
    
    // 진열대 선반들
    for (let i = 0; i < 4; i++) {
        const shelfGeometry = new THREE.BoxGeometry(7.5, 0.05, 0.3);
        const shelfMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xDEB887,
            roughness: 0.5
        });
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, 0.5 + i * 0.6, 0.2);
        displayGroup.add(shelf);
        
        // 담배 팩들
        for (let j = 0; j < 10; j++) {
            const packGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.15);
            const packMaterial = new THREE.MeshStandardMaterial({ 
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 0.6, 0.4)
            });
            const pack = new THREE.Mesh(packGeometry, packMaterial);
            pack.position.set(-3.5 + j * 0.7, 0.65 + i * 0.6, 0.2);
            pack.castShadow = true;
            displayGroup.add(pack);
        }
    }
    
    return displayGroup;
}

const cigaretteDisplay = createCigaretteDisplay();
cigaretteDisplay.position.set(15, 0, 20); // 계산대 뒤 벽
cigaretteDisplay.rotation.y = Math.PI; // 벽을 향하도록 회전
scene.add(cigaretteDisplay);

// 냉장고 음료수 상품들
function createCoolerDrinks(width) {
    const drinks = [];
    for (let i = 0; i < Math.floor(width / 0.8); i++) {
        const can = createCanDrink();
        can.position.set(-width/2 + 0.4 + i * 0.8, 0.8, 0.2);
        drinks.push(can);
    }
    return drinks;
}

// 대형 냉장고(유리문) 생성 - 안쪽 벽
function createCooler(x, z, width) {
    const coolerGroup = new THREE.Group();
    
    // 냉장고 본체
    const bodyGeometry = new THREE.BoxGeometry(width, 3, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xE0E0E0,
        metalness: 0.3,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    coolerGroup.add(body);
    
    // 유리문 (반사 재질 적용)
    const doorGeometry = new THREE.BoxGeometry(width - 0.2, 2.5, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.3,
        metalness: 0.95,  // 더 높은 반사
        roughness: 0.05   // 더 낮은 거칠기
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.4, 0.5);
    door.castShadow = true;
    coolerGroup.add(door);
    
    // 냉장고 내부 조명
    const internalLight = new THREE.PointLight(0xFFFFFF, 0.3, 3);
    internalLight.position.set(0, 1.5, 0.3);
    coolerGroup.add(internalLight);
    
    // 음료수 상품들 (캔 음료)
    for (let i = 0; i < Math.floor(width / 0.8); i++) {
        const can = createCanDrink();
        can.position.set(-width/2 + 0.4 + i * 0.8, 0.8, 0.2);
        
        productItems.push(can);
        coolerGroup.add(can);
    }
    
    coolerGroup.position.set(x, 0, z);
    return coolerGroup;
}

// 안쪽 벽에 대형 냉장고 배치
scene.add(createCooler(-10, -24, 8));
scene.add(createCooler(0, -24, 8));
scene.add(createCooler(10, -24, 8));

// 아바타 생성 (그룹으로 구성)
const avatarGroup = new THREE.Group();

// 아바타 본체 (구체)
const avatarGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const avatarMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
const avatarBody = new THREE.Mesh(avatarGeometry, avatarMaterial);
avatarBody.position.y = 0;
avatarBody.castShadow = true;
avatarGroup.add(avatarBody);

// 코 (작은 원뿔 형태로 방향 표시)
const noseGeometry = new THREE.ConeGeometry(0.15, 0.3, 8);
const noseMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
const nose = new THREE.Mesh(noseGeometry, noseMaterial);
nose.position.set(0, 0.1, 0.5); // 앞쪽에 배치
nose.rotation.x = Math.PI / 2; // 앞을 향하도록 회전
nose.castShadow = true;
avatarGroup.add(nose);

// 눈 (왼쪽)
const leftEyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
leftEye.position.set(-0.15, 0.15, 0.4);
leftEye.castShadow = true;
avatarGroup.add(leftEye);

// 눈 (오른쪽)
const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
rightEye.position.set(0.15, 0.15, 0.4);
rightEye.castShadow = true;
avatarGroup.add(rightEye);

// 눈동자 (왼쪽)
const pupilGeometry = new THREE.SphereGeometry(0.04, 16, 16);
const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
leftPupil.position.set(-0.15, 0.15, 0.45);
avatarGroup.add(leftPupil);

// 눈동자 (오른쪽)
const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
rightPupil.position.set(0.15, 0.15, 0.45);
avatarGroup.add(rightPupil);

avatarGroup.position.set(0, 1, 18); // 입구 근처에서 시작
scene.add(avatarGroup);

// 카메라를 아바타 위에 배치
camera.position.copy(avatarGroup.position);
camera.position.y += 1.5;

// 키보드 컨트롤
const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

const speed = 0.15;
const rotationSpeed = 0.03;
const interactionDistance = 2.0; // 상품과의 상호작용 거리
const cameraDistance = 4.0; // 3인칭 카메라 거리
const cameraHeight = 2.0; // 카메라 높이

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.backward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            keys.forward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            keys.backward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            keys.right = false;
            break;
    }
});

// 마우스로 시점 회전
let isPointerLocked = false;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body;
});

document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        mouseX -= event.movementX * rotationSpeed;
        mouseY -= event.movementY * rotationSpeed;
        mouseY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mouseY));
    }
});

// 창 크기 조절
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 팝업 요소
const popup = document.getElementById('item-popup');

// 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);
    
    // 아바타 이동
    const direction = new THREE.Vector3();
    
    if (keys.forward) {
        direction.z -= 1;
    }
    if (keys.backward) {
        direction.z += 1;
    }
    if (keys.left) {
        direction.x -= 1;
    }
    if (keys.right) {
        direction.x += 1;
    }
    
    direction.normalize();
    
    if (direction.length() > 0) {
        const moveVector = direction.clone();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);
        
        avatarGroup.position.x += moveVector.x * speed;
        avatarGroup.position.z += moveVector.z * speed;
        
        // 아바타가 움직이는 방향으로 회전
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        avatarGroup.rotation.y = targetRotation;
        
        // 마트 경계 제한 (실내 공간에 맞춰 조정)
        avatarGroup.position.x = Math.max(-22, Math.min(22, avatarGroup.position.x));
        avatarGroup.position.z = Math.max(-24, Math.min(22, avatarGroup.position.z));
    }
    
    // 상품과의 거리 확인 및 팝업 표시
    let nearestProduct = null;
    let nearestDistance = Infinity;
    
    productItems.forEach(product => {
        // 상품의 월드 좌표 계산
        const productWorldPosition = new THREE.Vector3();
        product.getWorldPosition(productWorldPosition);
        
        // 아바타와 상품 간의 거리 계산
        const distance = avatarGroup.position.distanceTo(productWorldPosition);
        
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestProduct = product;
        }
    });
    
    // 가장 가까운 상품이 상호작용 거리 이내이면 팝업 표시
    if (nearestDistance < interactionDistance && nearestProduct) {
        popup.classList.remove('hidden');
    } else {
        popup.classList.add('hidden');
    }
    
    // 카메라 업데이트 (3인칭 백뷰)
    // 기본 카메라 오프셋 (아바타 뒤쪽)
    const cameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance);
    
    // 마우스 수평 회전만 적용 (아바타 주변 회전)
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);
    
    // 카메라 위치 설정
    camera.position.copy(avatarGroup.position);
    camera.position.add(cameraOffset);
    
    // 카메라가 항상 아바타를 바라보도록 설정
    const lookAtTarget = avatarGroup.position.clone();
    lookAtTarget.y += 0.5 + mouseY; // 수직 시점 조절
    camera.lookAt(lookAtTarget);
    
    renderer.render(scene, camera);
}

animate();