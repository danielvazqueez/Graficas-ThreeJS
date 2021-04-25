import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { BufferGeometry } from 'three'

// The template was extracted from the youtube video:
// https://www.youtube.com/watch?v=pUgWfqWZWmM

// Debug
const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const parameters = {
    'color': 0x646464,
    'randomStars': 5000, 
    'size': 0.02,
    'galaxyRadius': 7,
    'galaxyStars': 60000,
    'galaxyBranches': 5,
    'spin': 1,
    'randomMovement': 0.20,
    'randomPower': 2,
    'insideColor': '#ff6800',
    'outsideColor': '#299bbe'
}

// Textures
// The textures for the earth 
// were downloaded from: http://planetpixelemporium.com/earth.html
const textureLoader = new THREE.TextureLoader()
const earthMap = textureLoader.load('/8081_earthmap4k.jpg')
const bumpMap = textureLoader.load('/8081_earthbump4k.jpg')
const specularMap = textureLoader.load('/8081_earthspec4k.jpg')
const cloudmap = textureLoader.load('/earthcloudmap.jpg')
const cloudmapt = textureLoader.load('/earthcloudmaptrans.jpg')
const stars = textureLoader.load('/textures/particles/1.png')
// Lights
scene.add(new THREE.AmbientLight(0x333333));

var sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(5,3,5);
scene.add(sun);


// Earth
const earth = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5,32,32),
    new THREE.MeshPhongMaterial({
        map: earthMap,
        bumpMap: bumpMap,
        bumpScale: 0.005,
        specularMap: specularMap,
        specular: parameters.color
    })
)
scene.add(earth)
    
gui.addColor(parameters, 'color')
    .onChange(() => {
        earth.material.specular.set(parameters.color)
    })
//Clouds
const clouds = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.51, 32, 32),
    new THREE.MeshPhongMaterial({
        map: cloudmap,
        alphaMap: cloudmapt,
        transparent: true,
        depthWrite: false
    })
)
earth.add(clouds)


// Galaxy
// The tutorial for how to make this galaxy was adapted from the online course
// which can be found here: https://threejs-journey.xyz/ by Bruno Simon
let starGeometry = null
let points = null
let material = null
let galaxyStarGeometry = null
let materialGalaxy = null
let pointsGalaxy = null
const createGalaxy = () => {
    // Dispose unused stars
    if (points !== null) {
        starGeometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    if (pointsGalaxy !== null) {
        galaxyStarGeometry.dispose()
        materialGalaxy.dispose()
        scene.remove(pointsGalaxy)
    }
    // Creating the positions of the stars
    starGeometry = new BufferGeometry()

    const positions = new Float32Array(parameters.randomStars * 3)
    for(let i = 0; i < parameters.randomStars; i++) {
        const index = i * 3
        positions[index] = (Math.random() - 0.5) * 10
        positions[index + 1] = (Math.random() - 0.5) * 10
        positions[index + 2] = (Math.random() - 0.5) * 10
    }
    starGeometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(positions, 3)
    )
    // Material of the randomStars
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: stars
    })
    
    points = new THREE.Points(starGeometry, material)
    
    // Creating the positions of the rotating galaxy
    galaxyStarGeometry = new BufferGeometry()
    const positionsGalaxy = new Float32Array(parameters.galaxyStars * 3)
    const colors = new Float32Array(parameters.galaxyStars * 3)

    const insideColorObj = new THREE.Color(parameters.insideColor)
    const outisdeColorObj = new THREE.Color(parameters.outsideColor)
    for(let i = 0; i < parameters.galaxyStars; i++) {
        const index = i * 3

        const radius = Math.pow(Math.random(), 1.7) * parameters.galaxyRadius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.galaxyBranches) / parameters.galaxyBranches * 2 * Math.PI

        const randomX = Math.pow(Math.random(), parameters.randomPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomMovement
        const randomY = Math.pow(Math.random(), parameters.randomPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomMovement
        const randomZ = Math.pow(Math.random(), parameters.randomPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomMovement
        positionsGalaxy[index] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positionsGalaxy[index + 1] = randomY - 1
        positionsGalaxy[index + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        const mixedColor = insideColorObj.clone()
        mixedColor.lerp(outisdeColorObj, radius / parameters.galaxyRadius)
        colors[index] = mixedColor.r
        colors[index + 1] = mixedColor.g
        colors[index + 2] = mixedColor.b
    }
    galaxyStarGeometry.setAttribute(
        'position', 
        new THREE.BufferAttribute(positionsGalaxy, 3)
    )

    galaxyStarGeometry.setAttribute(
        'color', 
        new THREE.BufferAttribute(colors, 3)
    )
    // Material of the galaxy stars
    materialGalaxy = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: stars,
        vertexColors: true,
        map: stars
    })
    
        
    pointsGalaxy = new THREE.Points(galaxyStarGeometry, materialGalaxy)
    scene.add(points, pointsGalaxy )
        
}
    
    createGalaxy()
    gui.add(parameters, 'randomStars').min(1000).max(10000).step(1000).onFinishChange(createGalaxy)
    gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(createGalaxy)
    gui.add(parameters, 'galaxyRadius').min(1).max(20).step(1).onFinishChange(createGalaxy)
    gui.add(parameters, 'galaxyStars').min(10000).max(200000).step(1000).onFinishChange(createGalaxy)
    gui.add(parameters, 'galaxyBranches').min(2).max(20).step(1).onFinishChange(createGalaxy)
    gui.add(parameters, 'spin').min(-5).max(5).step(0.01).onFinishChange(createGalaxy)
    gui.add(parameters, 'randomMovement').min(0).max(2).step(0.01).onFinishChange(createGalaxy)
    gui.add(parameters, 'randomPower').min(1).max(10).step(0.01).onFinishChange(createGalaxy)
    gui.addColor(parameters, 'insideColor').onFinishChange(createGalaxy)
    gui.addColor(parameters, 'outsideColor').onFinishChange(createGalaxy)
    
    //Screen
    const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Make sure resizing still works when shrinking the screen
window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 1.5
camera.position.y = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animation
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    clouds.rotation.y = elapsedTime * 0.075
    earth.rotation.y = elapsedTime * 0.05
    controls.update()

    renderer.render(scene, camera)

    // Nested loop
    window.requestAnimationFrame(tick)
}

tick()