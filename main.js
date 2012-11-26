enchant();

var game;
window.addEventListener('load', function(){
    game = new Game(640, 640);
    game.preload('enchant.png', 'tibi.png');
    game.fps = 60;
    game.addEventListener('load', function(){
        // create 3D scene
        var scene = new Scene3D();
        // create light
        var light = new DirectionalLight();
        light.directionZ = -1;
        light.color = [1.0, 1.0, 1.0];
        scene.setDirectionalLight(light);
        // create camera
        var camera = new Camera3D();
        // camera.x = 0;
        // camera.y = 0;
        // camera.z = -15;
        camera.centerZ = 200;
        scene.setCamera(camera);
        // create Sphere
        // for(var i = 0; i < 100; i++){
        //     new Obstacle(scene, camera);
        // }
        // new Obstacle(scene, camera);
        // var s = new Sphere(1);
        // s.x = 0;
        // s.y = 0;
        // s.z = 10;
        // scene.addChild(s);
        // new Obstacle(scene, camera);
        // var v = new Sphere(1);
        // v.x = 5;
        // v.y = 5;
        // v.z = 20;
        // scene.addChild(v);
        
        // 
        game.rootScene.addEventListener('enterframe', function(e){
            var input = game.input;
            if(input.left){ camera.sidestep(0.1); camera.x += 0.1;}
            if(input.right){ camera.sidestep(-0.1); camera.x -= 0.1; }
            if(input.up){ camera.altitude(0.1); camera.y += 0.1; }
            if(input.down){ camera.altitude(-0.1); camera.y -= 0.1; }
            if(game.frame % 60 == 0){
                new Obstacle(scene, camera);
            }
            // if(input.left){  camera.centerX += 0.1;}
            // if(input.right){  camera.centerX -= 0.1; }
            // if(input.up){  camera.centerY += 0.1; }
            // if(input.down){  camera.centerY -= 0.1; }
        });
    },false);
    game.start();
}, false);

var Obj = enchant.Class.create(enchant.gl.primitive.Sphere, {
    initialize: function(scene){
        enchant.gl.primitive.Sphere.call(this);
        this.theta = 0;
        this.matrix = new mat4.create();
        this.mesh.ambient = [0.3, 0.3, 0.3, 1.0];
        this.mesh.diffuse = [0.5,0.5, 0.5, 1.0];
        this.mesh.specular = [0.5, 0.5, 0.5, 1.0];
        this.addEventListener('enterframe', function(e){
            mat4.identity(this.matrix);
            this.theta += 0.01;
            mat4.rotateY(this.matrix, this.theta);
            this.rotation = this.matrix;
        });
        scene.addChild(this);
    },
    remove: function(scene){
        scene.removeChild(this);
        delete this;
    }
});
var Obstacle = enchant.Class.create(Obj, {
    initialize: function(scene, camera){
        Obj.call(this, scene);
        this.az = 0;
        this.x = camera.x;
        this.y = camera.y;
        this.z = 200;
        this.matrix = new mat4.create();
        // this.mesh.setBaseColor("#f18b8c");
        // テクスチャをつける
        this.mesh.texture = new Texture('tibi.png');
        this.addEventListener('enterframe', function(e){
            this.az -= 0.1;
            this.z += this.az;
            if(this.z < camera.z){
                this.remove(scene);
                alert("x: " + this.x + "y: " + this.y);
                
            }
        });
    }
});
