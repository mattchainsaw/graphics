
THREE.PortHole = function(scene, color) {

    var portal = new THREE.PerspectiveCamera(40,1,0.1,1000);
    var renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
        {format: THREE.RGBFormat, magFilter: THREE.LinearMipMapLinearFilter, minFilter: THREE.LinearMipMapLinearFilter});
    portal.renderTarget = renderTarget;
    var other_portal;

    var geometry = new THREE.RingGeometry(0.001, 8);
    var rimGeometry = new THREE.RingGeometry(7.8, 8.3);
    var material = new THREE.ShaderMaterial({
        uniforms: {tDiffuse: {type: 't', value: renderTarget}},
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragment_shader_screen').textContent,
        depthWrite: true
    });
    var rimMaterial = new THREE.MeshBasicMaterial({color: color});
    rimMaterial.transparent = true;
    rimMaterial.opacity = 0.4;
    var body = new THREE.Mesh(geometry, material);
    var rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.z = 0.001;
    body.add(rim);
    this.normal = new THREE.Vector3();
    body.position.y = -100; // outta the way

    this.shoot = function (position, rotation, normal) {
        body.position.copy(position);
        body.rotation.copy(rotation);
        portal.position.copy(position);
        portal.scale.x = -1; // for mirror
        if (normal.z == -1) other_portal.scale.y = -1; // for back wall
        else other_portal.scale.y = 1;
        this.normal = normal;
        portal.lookAt(new THREE.Vector3().addVectors(position, normal));
    };

    this.getObject = function () {
        return body;
    };

    this.getViewer = function() {
        return portal;
    };

    this.setViewer = function(port) {
        other_portal = port;
        body.material.envMap = other_portal.renderTarget;
    };

    this.update = function(renderer, scene) {
        renderer.render(scene, other_portal, renderTarget);
    };

};
