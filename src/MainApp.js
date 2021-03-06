/**
 * Created by jollzy on 30/11/2015.
 */
var stage = new PIXI.Container();
var gameWidth = Constants.GAME_WIDTH;
var gameHeight = Constants.GAME_HEIGHT;
var renderer = PIXI.autoDetectRenderer(gameWidth, gameHeight);
var game = null;
var snailMove;
//size will holds throughout the game window bounds when window is resized
var size = getWindowBounds();

//we will render acording to the current window bounds
var renderer = PIXI.autoDetectRenderer(size.x, size.y);

window.onload = function() {

    function loadJSON(file,callback) {

        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', file, true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function responseHandler(response) {
        // Parse JSON string into object
        var actual_JSON = JSON.parse(response);
        //console.log(actual_JSON);
        var assetLoader = new AssetLoader();
        Events.Dispatcher.addEventListener(GameEventType.ASSETS_LOADED,onAssetsLoaded);
        assetLoader.loadX(actual_JSON);
    }

    function onAssetsLoaded(){
        console.log("Assets loaded!");
        Events.Dispatcher.removeEventListener(GameEventType.ASSETS_LOADED,onAssetsLoaded);

        //load the Game
        game = new Game();
        game.onAssetsLoaded();
        gameWidth = game.bg.getBounds().width;
        gameHeight = game.bg.getBounds().height;
        document.body.appendChild(renderer.view);
        window.addEventListener('resize', onWindowResize);

        //resize the game when all assets loaded
        onWindowResize();

        loadSound();
    }

    loadJSON("assets.json", responseHandler);

};

function getWindowBounds(){
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return new Point(x,y);
};

function Point(x, y){
    this.x = x;
    this.y = y;
};

function Rectangle(x,y,w,h){
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
};

/**
 * I am very proud of this little code here
 * this function takes care any size of mobile devices
 */
function onWindowResize(Event){
    var size = getWindowBounds();
    renderer.resize(size.x,size.y);

    var scaleX = size.x / gameWidth;
    var scaleY = size.y / gameHeight;
    var finalScale = scaleY;
    if(scaleX < scaleY){
        finalScale = scaleX;
    }

    var scale = new Point(finalScale, finalScale);

    // Temp: center everything on the stage!
    for(var child=0; child<stage.children.length; ++child){
        if(stage.children[child].resize)stage.children[child].resize({size:size,scale:scale});
    }
};

//lets add some sound to our game
function loadSound() {
    soundManager.setup({
        onready: function () {
            snailMove = soundManager.createSound({
                id: "snailmove",
                url: "assets/sounds/snail_move.mp3"
            });
            soundManager.createSound({
                id: "win",
                url: "assets/sounds/win.mp3"
            });
            soundManager.createSound({
                id: "lose",
                url: "assets/sounds/lose.mp3"
            });
        },

        ontimeout: function () {
            alert("oops no sound");
        }

    });
};

//we may want other loops so its a good place as any to access
function loopSound(sound) {
    sound.play({
        onfinish: function() {
            loopSound(sound);
        }

    });
};

