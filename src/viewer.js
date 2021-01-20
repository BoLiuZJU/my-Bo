import * as THREE from "three";
import {
    Scene
} from "three";

// import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {
    TrackballControls
} from "three/examples/jsm/controls/TrackballControls"

import {
    OrbitControls
} from "three/examples/jsm/controls/OrbitControls"

import createheartmesh from './threejsutil/createheartmesh'


function resizeRendererToDisplaySize(renderer){
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

 function perspectivecam(renderer){
    const fov = 75;
    // const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    return camera;
}


export default class Viewer {

    constructor(container) {

    }

    init_viewer(container) {
        this.container = container;
        this.scene = new Scene();
        // console.log(container);
        this.canvas = undefined;
        this.scene.background = new THREE.Color( 0xf0f0f0 );

        this.rootGroup = this.scene;

        // this.rootGroup.add(createheartmesh());

        // this.createOrthographicCamera();
        this.createrenderer();
        this.createPerspectiveCamera();
        this.setupLight();
        

        // this.container.addEventListener('resize', ()=>this.updateOrthCameraViewPort, false);

        // this.animate();
        this.dopick = true;

        this.setupcontrols1();

        this.raycaster = new THREE.Raycaster();
        // for highligh line
        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 3), 3));

        var material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true
        });

        // this.line = new THREE.Line(geometry, material);
        // this.scene.add(this.line);

        var spgeometry = new THREE.SphereBufferGeometry(0.005);
        var spmaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });

        // this.sphereInter = new THREE.Mesh(spgeometry, spmaterial);
        // this.sphereInter.visible = false;
        // this.scene.add(this.sphereInter);

        this.mouse = undefined;
        this.INTERSECTED = undefined;
    }

    load_default_heart() {
        let mesh = createheartmesh();
        const box = new THREE.Box3();
        box.expandByObject(mesh);
        this.rootGroup.add(mesh);

        return box;
    }

    // OrthographicCamera is a little be complex skip this support now it
    // can reference the following treejs example
    // three.js/examples/misc_controls_trackball.html

    setupControlsOrth() {
        // new TrackballControls
        this.controls = new TrackballControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = 100.0;
        this.controls.maxDistance = 800.0;
        this.controls.dynamicDampingFactor = 0.1;

        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;

        this.controls.keys = [65, 83, 68];

    }

    setupcontrols1() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        this.controls.rotateSpeed = 3.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;

        this.controls.keys = [65, 83, 68];

    }

    createOrthographicCamera = () => {
        this.width = this.container.clientWidth
        this.height = this.container.clientHeight

        this.factor = ORTHOGRAPHIC_CAMERA_FACTOR;
        this.oCamera = new THREE.OrthographicCamera(
            -this.width / this.factor, this.width / this.factor,
            this.height / this.factor, -this.height / this.factor, 0.1, 10000);

        this.oCamera.position.z = 1000;
        this.oCamera.position.x = -1000;
        this.oCamera.position.y = 300;

        this.camera = this.oCamera;
        this.scene.add(this.oCamera);
    }



    createPerspectiveCamera = () => {

        this.pcamera = new THREE.PerspectiveCamera(45.0, window.innerWidth / window.innerHeight, 100, 1500.0);
        this.pcamera.position.z = 480.0;

        this.pcamera = perspectivecam(this.renderer);

        this.camera = this.pcamera;
        this.scene.add(this.camera);

        // controls = new TrackballControls( camera, renderer.domElement );
        // controls.minDistance = 100.0;
        // controls.maxDistance = 800.0;
        // controls.dynamicDampingFactor = 0.1;

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.2));

        var light = new THREE.PointLight(0xffffff, 0.7);
        this.camera.add(light);

        // createScene();

        // stats = new Stats();
        // document.body.appendChild( stats.dom );

        // window.addEventListener( 'resize', onWindowResize, false );

    }


    createrenderer = () => {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // console.log(this.container);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    setupLight = () => {
        this.ambinentlight = new THREE.AmbientLight(0xffffff, 0.2);
        this.pointlight = new THREE.PointLight(0xffffff, 0.7);

        this.scene.add(this.ambinentlight);
        this.camera.add(this.pointlight);

        this.canvas = this.renderer.domElement;
        this.container.appendChild(this.renderer.domElement);
        this.canvas = this.container.children[0];
        // document.body.appendChild( this.renderer.domElement );

    }


    animate() {
        requestAnimationFrame(() => this.animate());
    }


    updateOrthCameraViewPort() {
        let width = this.container.clientWidth;
        let height = this.container.clientHeight;
        let factor = ORTHOGRAPHIC_CAMERA_FACTOR;
        this.oCamera.left = -width / factor;
        this.oCamera.right = width / factor;
        this.oCamera.top = height / factor;
        this.oCamera.bottom = -height / factor;
        this.oCamera.updateProjectionMatrix();
    }

    updateperspectiveCameraViewPort() {

        this.camera.aspect = this.container.clientWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        // this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setSize(this.container.clientWidth, window.innerHeight);
        //        console.log(this.container);
        //        console.log(window.innerWidth, window.innerHeight)
        //        console.log(this.container.width, window.innerHeight);
        //        console.log(this.container.clientWidth, this.container.clientHeight);
    }


    onWindowResize = () => {
        // this.updateOrthCameraViewPort();
        this.updateperspectiveCameraViewPort();

        // trackball
        // this.controls.handleResize();
        resizeRendererToDisplaySize(this.renderer);
    };

    onMouseMove(screenX, screenY) {
        // console.log(`mouse: ${screenX}, ${screenY}`);

        let mouse = {
            x: screenX,
            y: screenY
        };


        this.mouse = mouse;
 

    }

    pickfun() {
        if (this.mouse==undefined) {
            return;
        }
        let mouse = this.mouse;

        this.raycaster.setFromCamera( mouse, this.camera );

        var intersects = this.raycaster.intersectObjects( this.scene.children );

        if ( intersects.length > 0 ) {

            var targetDistance = intersects[ 0 ].distance;

            // this.camera.focusAt( targetDistance ); // using Cinematic camera focusAt method

            if ( this.INTERSECTED != intersects[ 0 ].object ) {

                if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );

                this.INTERSECTED = intersects[ 0 ].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
                this.INTERSECTED.material.emissive.set( 'yellow' );

                if (this.handlepick) {
                    this.handlepick(this.INTERSECTED);
                }
            }

        } else {

            if ( this.INTERSECTED ) this.INTERSECTED.material.emissive.setHex( this.INTERSECTED.currentHex );

            this.INTERSECTED = null;

        }
    }

    render() {
        this.pointlight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
        this.camera.updateMatrix();
        if (this.dopick)
            this.pickfun();
        this.renderer.render(this.scene, this.camera);
    }

    update() {
        this.controls.update();
        this.render();
    }

    savecanvas() {
        // must draw first then save canvas?
        this.renderer.render(this.scene, this.camera);

        // let cc = this.container.children[0];
        // let a = this.renderer.domElement;
        let canvas = this.renderer.domElement;
        const dataURI = canvas.toDataURL('image/png');
  
        // revert to old size
        // resize();
      
        // force download
        const link = document.createElement('a');
        link.download = 'Screenshot.png';
        link.href = dataURI;
        link.click();
    }
}



const ORTHOGRAPHIC_CAMERA_FACTOR = 1;