
THREE.PortHole = function(scene, color) {

    var portal = new THREE.CubeCamera(0.1, 100, 1024);
    portal.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
    var other_portal;
    this.arrow = new THREE.ArrowHelper(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,0), 20, 0x336688);

    var geometry = new THREE.RingGeometry(0.0001, 8);
    var material = new THREE.MeshPhongMaterial();
    var body = new THREE.Mesh(geometry, material);
    this.normal = new THREE.Vector3();

    this.shoot = function (position, rotation, normal) {
        body.position.copy(position);
        body.rotation.copy(rotation);
        portal.position.copy(position);
        portal.scale.x = -1; // for mirror
        this.normal = normal;
        this.arrow.position.copy(position);
        this.arrow.setDirection(normal);
        portal.lookAt(new THREE.Vector3().addVectors(position, normal));
    };

    var turn = function(turns) {
        portal.rotateY(turns * Math.PI / 2)
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

    var added = false;
    this.update = function(renderer, scene) {
        portal.updateCubeMap(renderer, scene);
        if (!added) {
            scene.add(this.arrow);
            added = true;
        }

    };

};
