enchant();

var obstacles = [];
var game;
window.addEventListener('load', function(){
    game = new Game(640, 640);
    game.preload('image/earth.png', 'image/sight.png', 'audio/bomb.ogg', 'audio/shot.ogg', 'audio/gameover.ogg');
    game.fps = 24;
    game.addEventListener('load', function(){
        var sight = Sprite(100,100);
        sight.image = game.assets['image/sight.png'];
        sight.frame = 0;
        sight.width = sight.height = 100;
        sight.x = (game.width / 2) - (sight.width / 2) - 1;
        sight.y = (game.height/ 2) - (sight.height / 2);
        sight.opacity = 0.5
        game.rootScene.addChild(sight);
        // create 3D scene
        var scene = new Scene3D();
        // create light
        var light = new DirectionalLight();
        light.directionZ = -1;
        light.color = [1.0, 1.0, 1.0];
        scene.setDirectionalLight(light);
        // create camera
        var camera = new Camera3D();
        camera.centerZ = 200;
        scene.setCamera(camera);
        // create obstacle
        obstacles.flag = true;
        for(var i = 0; i < 50; i++){
            var obstacle = new Obstacle(scene);
            obstacle.key = i;
            obstacles.push(obstacle);
        }

        game.keybind(32, "a");
        var pos = true;
        game.rootScene.addEventListener('enterframe', function(e){
            // なんかかってに始まるので苦肉の策
            if(obstacles.flag){
                for(var i = 0; i < obstacles.length; i++){
                    obstacles[i].start();
                }
                obstacles.flag = false;
            }
            var input = game.input;
            if(input.left){
                camera.sidestep(0.1); camera.x += 1; camera.centerX = camera.x;
            }else if(input.right){
                camera.sidestep(-0.1); camera.x -= 1; camera.centerX = camera.x;
            }
            if(input.up){ 
                camera.altitude(0.1); camera.y += 1; camera.centerY = camera.y;
            }else if(input.down){
                camera.altitude(-0.1); camera.y -= 1; camera.centerY = camera.y;
            }
            // スペースキーが押されたら弾を発射
            if(input.a){
                new Shot(scene, pos);
                game.assets['audio/shot.ogg'].play();
                pos = !pos;
            }
        });
    }, false);
    game.start();
}, false);

var Obj = enchant.Class.create(enchant.gl.primitive.Sphere, {
    initialize: function(scene, r){
        if(typeof r === 'undefined'){
            r = 1;
        }
        enchant.gl.primitive.Sphere.call(this, r);
        var theta = 0;
        var matrix = new mat4.create();
        this.az = 0;
        this.scene = scene;
        this.mesh.ambient = [0.3, 0.3, 0.3, 1.0];
        this.mesh.diffuse = [0.5,0.5, 0.5, 1.0];
        this.mesh.specular = [0.5, 0.5, 0.5, 1.0];
        // オブジェクトをゆっくり回転させる
        this.addEventListener('enterframe', function(e){
            mat4.identity(matrix);
            theta += 0.1;
            mat4.rotateY(matrix, theta);
            this.rotation = matrix;
        });
    },
    remove: function(){
        this.scene.removeChild(this);
        delete this;
    },
    start: function(){
        this.scene.addChild(this);
    }
});
var Obstacle = enchant.Class.create(Obj, {
    initialize: function(scene, x, y, z){
        this.camera = scene.getCamera();
        if(typeof x === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            x = this.camera.x + Math.floor(Math.random() * 20 *  diff);
        }
        if(typeof y === 'undefined'){
            var diff = Math.floor(Math.random() * 2) == 0 ? 1 : -1;
            y = this.camera.y + Math.floor(Math.random() * 20 * diff);
        }
        if(typeof z === 'undefined'){
            z = 100 + Math.floor(Math.random() * 200);
        }
        // 大きさはランダムで
        this.r = (Math.random() * 3).toFixed(1);
        Obj.call(this, scene, this.r);
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh.texture = new Texture('image/earth.png');
        this.addEventListener('enterframe', function(e){
            this.az -= 0.3;
            this.z += this.az;
            if(this.z < this.camera.z){
                // 障害物に当たると終了
                if(Math.abs(this.x - this.camera.x) < 2 && Math.abs(this.y - this.camera.y) < 2){
                    game.assets['audio/gameover.ogg'].play();
                    game.end("end!");
                }
                var o = null;
                if(this.key == 0){
                    o = new Obstacle(scene, this.camera.x, this.camera.y, 200);
                }else{
                    o = new Obstacle(scene);
                }
                o.key = this.key;
                obstacles[this.key] = o;
                obstacles[this.key].start();
                this.remove();
            }
        });
    },
    key: 0,
});

var Shot = enchant.Class.create(Obj, {
    initialize: function(scene, flag){
        var posx = flag ? 5 : -5;
        var dx = flag ? -0.2 : 0.2;
        Obj.call(this, scene);
        this.camera = scene.getCamera();
        this.x = this.camera.x + posx;
        this.y = this.camera.y;
        this.z = this.camera.z + 10;
        this.mesh.setBaseColor("#f16b5c");
        this.addEventListener('enterframe', function(e){
            this.az += 1.5;
            this.z += this.az;
            if(this.x != this.camera.x){
                this.x += dx;
            }
            for(var i = 0; i < obstacles.length; i++){
                var ob = obstacles[i];
                var hitarea = 20;
                if(this.bounding.toBS(ob.bounding) < hitarea){
                    var o = null;
                    if(this.key == 0){
                        o = new Obstacle(scene, this.camera.x, this.camera.y, 200);
                    }else{
                        o = new Obstacle(scene);
                    }
                    o.key = ob.key;
                    obstacles[ob.key] = o;
                    obstacles[ob.key].start();
                    ob.remove();
                    this.remove();
                    game.assets['audio/bomb.ogg'].play();
                }
            }
            if(this.z > 500){
                this.remove();
            }
        });
        this.start();
    }
});
