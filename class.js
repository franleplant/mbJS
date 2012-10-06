//PRELIMINARES

var celda= 30;

//Funcion limitadora
function limiter(min,number,max){
	if(number<min) {	number=min	};
	if(number>max) {	number=max	};
	return number;
};

//funcion de Colisiones ancestral
function collides(a, b) {
	console.log();
	  return a.pos.x < b.pos.x + b.size.w &&
	         a.pos.x + a.size.w > b.pos.x &&
	         a.pos.y < b.pos.y + b.size.h &&
	         a.pos.y + a.size.h > b.pos.y;
	         
};
//CLASES


//XY
//----------------------------------------------
function XY(x,y){
	this.x = x;
	this.y = y;
}
//----------------------------------------------


//SIZE
//----------------------------------------------
function Size(w,h){
	this.w = w;
	this.h = h;
}
//----------------------------------------------


//FACE
//----------------------------------------------
function Face(clipX, clipY, w,h){
	this.clip = new XY(clipX, clipY);
	this.size = new Size(w,h);
}

Face.prototype.draw = function(pos,d,img,game){
	game.canvas.drawImage(img, this.clip.x, this.clip.y, this.size.w,this.size.h, pos.x + d.x, pos.y + d.y, this.size.w, this.size.h); 	
}
//----------------------------------------------


//LEVEL
//----------------------------------------------
function Level(color, parts){
	this.backColor = color;
	this.parts = parts;
}

Level.prototype.draw = function( d ){
	for(var i in this.parts){
		this.parts[i].draw( d );
	};
}
//----------------------------------------------



//GAME
//----------------------------------------------
function Game(width, height, FPS){
	
	
	this.lvls = [];
	this.lvlActual = [];
	this.lvlIndex = 0;
	this.player = 0; //new Player(30,60,document.getElementById("player"),this);
	this.size = new Size(width || 600, height || 400);
	this.FPS = FPS || 50; 
	this.d = new XY(0,0); 
	this.canvas = this.createContext();
	//this.celda = 30;
}

Game.prototype.createContext = function (){
	var canvasElement = $("<canvas id='canvas' width='" + this.size.w +  "' height='" + this.size.h + "'></canvas>");
	canvasElement.appendTo('body');	 
		return canvasElement.get(0).getContext("2d");	
	};
	
Game.prototype.beginGame = function(){
	this.loadLvl();
	var game = this;
	setInterval(function(){
		game.mainLoop();
		}, 1000/this.FPS);
};

Game.prototype.loadLvl = function(){
	this.lvlActual = this.lvls[this.lvlIndex]
};

Game.prototype.mainLoop = function(){
	
	this.clean();
	//this.calculate(); //bloqueCinetico
	this.listen();
	this.handleCollisions();
	this.draw();	
};

Game.prototype.clean = function(){
	this.canvas.clearRect(0, 0, this.size.w, this.size.h);
	this.canvas.fillStyle = "#5983FF";
	this.canvas.fillRect(0, 0, this.size.w, this.size.h);
};

Game.prototype.draw = function(){

	this.lvlActual.draw( this.d );
	//this.player.draw();
	
};
Game.prototype.listen = function(){
	//this.player.listen();
};
Game.prototype.playerMoved = function(dx){
	this.d += dx;
	//para el principio					//falta para el final
	if(this.d > 0){
		this.player.queryMove();
	}
	this.d = limiter(-10000,this.d,0 );
};
//Game.prototype.calculate = function(){
//
//};

Game.prototype.handleCollisions = function(){
	if(collides(this.lvlActual.parts[2],this.lvlActual.parts[1])){
		console.log("collision");
		this.lvlActual.parts[2].vel.y = 0;
		this.lvlActual.parts[2].vPar.y = 0;
		this.lvlActual.parts[2].acel.y = 0;
	}
};
//----------------------------------------------



//VIEWABLE
//--------------------------------------------------------
function Viewable(x,y,w,h,img,game){
	this.pos = new XY(x,y);
	this.size = new Size(w,h);
	this.img = document.getElementById(img);
	this.game = game;
}

Viewable.prototype.draw = function( d ){//d debe ser negativa si avanzo a la derecha
	 this.game.canvas.drawImage(this.img, this.pos.x + d.x, this.pos.y + d.y, this.size.w, this.size.h); 	
}
//-----------------------------------------------------------


//FLOOR
//--------------------------------------------------------
function Floor(x,w,img,game){
	Viewable.call(this, x,game.size.h - celda,w,celda,img,game);
	this.parts = this.createParts(img);
}

Floor.prototype = new Viewable;

Floor.prototype.createParts = function(img){
	var out = [];
	for(var i = 0; i<this.size.w ;i++){		
		out[i] = new Viewable(this.pos.x + celda*i, this.pos.y, celda, this.size.h, img, this.game);
	};
	return out;
};

Floor.prototype.draw = function( d ){
	for(var i in this.parts){
		this.parts[i].draw( d );
	};
};
//-----------------------------------------------------------

var t = 0;
//ANIMABLE
//-----------------------------------------
function Animable(x,y,img,game,faces){
	Viewable.call(this,x,y,0,0,img,game);
	this.faces = faces;
	this.faceIndex = 0;
}

Animable.prototype = new Viewable;
Animable.prototype.draw = function(d){
	this.size.w = this.faces[this.faceIndex].size.w;
	this.size.h = this.faces[this.faceIndex].size.h;
	//simplemente muestra cada una de las faces
	//cambiarlo
	this.faces[this.faceIndex].draw( this.pos, d, this.img ,this.game );
	if(t % 30 == 0){this.faceIndex = (this.faceIndex + 1 ) % this.faces.length;}
	t++;
}
//gravedad
var g = -1;

//MOVEABLE
//------------------------------------------------------------
function Moveable(x,y,img,game,faces){
	Animable.call(this,x,y,img,game,faces);
	this.vel = new XY(0,0);
	this.vPar = new XY(0,0);
	this.acel = new XY(0,0);
}
Moveable.prototype = new Animable;
Moveable.prototype.kineticB = function(){
	//movimiento X
	this.vel.x += this.acel.x;
	this.vPar.x += -1/2 * this.acel.x;
	this.pos.x += this.vPar.x;
	
	//movimiento Y
	this.vel.y += this.acel.y;
	this.vPar.y += -1/2 * this.acel.y;
	this.pos.y += this.vPar.y;

}
Moveable.prototype.draw = function(d){
	this.size.w = this.faces[this.faceIndex].size.w;
	this.size.h = this.faces[this.faceIndex].size.h;
	this.kineticB();
	this.faces[this.faceIndex].draw( this.pos, d, this.img ,this.game );
	this.naturalRst();
}
Moveable.prototype.naturalRst = function(){
	this.acel.x = 0;
	this.acel.y = g;	
};


//------------------------------------------------------------


//PLAYER
//aca van las siguientes variables que contienen los sprites
var marioMini;
var marioSuper;
var marioFire;
var A_MAX_WALK_X = 2;
var A_FACT_RUN_X = 1.5;
var A_MAX_JUMP = 2;
var V_MAX_JUMP = 10;

//------------------------------------------------------------
function Player(){
	Moveable.call(this,x,y,img,game,marioMini);
}
Player.prototype = new Moveable;
Player.prototype.draw = function(){
	this.game.canvas.drawImage(this.img,this.pos.x,this.pos.y,this.size('w'),this.size('h'));
	this.kineticB();
	this.inertialB();
	this.listen();
};
var bandera;
Player.prototype.listen = function(){
	if(keydown.right){
		this.acel.x = A_MAX_WALK_X;
	};
	if(keydown.left){
		this.acel.x = - A_MAX_WALK_X;
	};
	if(keydown.down){
		this.duck();
	};
	//faster
	if(keydown.z){
		this.acel.x = this.acel.x*A_FACT_RUN_X ;
	};
	//jump
	//condicion de inicio del salto: si está quieto
	if(keydown.x){
		if(this.acel.y == 0 && this.vel.y == 0){ //si esta quieto puede saltar
			this.acel.y = -A_MAX_JUMP;
			bandera = true;
		};
		if(this.vel.y > -V_MAX_JUMP && bandera){ //su esta saltando puede seguir aprentando para saltar mas alto
			this.acel.y = -A_MAX_JUMP;
		};	
	}else{
		if(this.vel.y != 0){ //si esta moviendose en Y, y no apreta para saltar entonces ya no puede saltar
			bandera = false;
		}
	}
	if(this.vel.y == -V_MAX_JUMP ){ //si llego a la V_MAX_JUMP entonces mas alto no puede saltar
		bandera = false;
	};	
	
	//shoot
	if(keydown.c){
		console.log("PIU!");
	};
	
	
};
Player.prototype.jump = function(){
	
};
Player.prototype.inertialB = function(){
	
};
Player.prototype.size = function(opcion){
	if(opcion == 'w'){
		return this.faces[this.faceIndex].size.w;
	}
	if(opcion == 'h'){		
		return this.faces[this.faceIndex].size.h;
	}
};
Player.prototype.duck = function(){};
Player.prototype.ejemplo = function(){};



//------------------------------------------------------------


//PLAYER viejo
//-----------------------------------------------------------
//function Player(w,h,img,game){
//	Element.call(this, (game.width - w)/2, (game.height - h - 30), w, h, img, game,0,0);
//	this.state = "normal";
//	this.score = 0;
//
//	//walk
//	this.twalk = 0;
//	this.ax = 1;
//	this.vx = 8;
//	this.vxActual = 0;
//	this.vxMax = 7;
//	//salto
//	this.yp0 = this.y;
//	this.jumpt = 0;
//	this.j = 1;
//	this.k0 = 200;
//	this.h0 = Math.sqrt(this.y - this.k0);
//	this.k = this.k0;
//	this.h0 = this.h0;
//}
//
//Player.prototype = new Element;
//
//Player.prototype.calcY = function(game){
//	//Subo el jugador dos unidades (30 x 30) por el piso;
//	return game.height - this.height - 60;
//};
//
//Player.prototype.draw = function(){
//	this.game.canvas.drawImage(this.img,this.x,this.y,this.width,this.height);
//};
//
//Player.prototype.listen = function(){
//	this.queryJump();
//	this.queryWalk();
//	this.y = limiter(0,this.y, this.yp0);
//
//};
//
//Player.prototype.dead = function(){};
//Player.prototype.hurt = function(){};
//Player.prototype.evolve = function(){};
//Player.prototype.getCoin = function(){};
//Player.prototype.duck = function(){};
//Player.prototype.queryWalk = function(){
//
//		if(keydown.right){
//			this.vxActual -= this.ax;
//			//para el principio
//			if(this.x < (this.game.width - this.width)/2){
//				this.x -= this.vxActual;};
//		}else{ 
//			if(this.vxActual < 0){	
//				this.vxActual += this.ax;
//				console.log(this.vxActual);
//			}
//		}	
//		if(keydown.left){
//			this.vxActual += this.ax;
//		} else { 
//			if( this.vxActual > 0 ){	
//				this.vxActual -= this.ax; 
//			}
//		}	
//		if(keydown.z && this.jumpt==0){
//			this.vxMax = 20;
//		}else{
//			if(this.vxMax > 8){	
//				this.vxMax -= this.ax;
//			}
//		}
//		
//	this.vxActual = limiter(-this.vxMax,this.vxActual, this.vxMax);
//	this.x = limiter(0, this.x, this.game.width);
//	this.game.jugadorSeMovio( this.vxActual );
//
//	
//
//};
//
//Player.prototype.queryMove = function(){
//	if(keydown.right){
//		this.vxActual -= this.ax;
//		this.x += this.vxActual;
//	}else{ 
//		if(this.vxActual < 0){	
//			this.vxActual += this.ax;
//		}
//	}	
//	if(keydown.left){
//		this.vxActual += this.ax;
//		this.x -= this.vxActual;
//	} else { 
//		if( this.vxActual > 0 ){	
//			this.vxActual -= this.ax; 
//			this.x -= this.vxActual;
//		}
//	}	
//	if(keydown.z && this.jumpt==0){
//		this.vxMax = 20;
//	}else{
//		if(this.vxMax > 8){	
//			this.vxMax -= this.ax;
//		}
//	}
//	
//	this.vxActual = limiter(-this.vxMax,this.vxActual, this.vxMax);
//	this.x = limiter(0, this.x, this.game.width);
//};
//
//Player.prototype.queryJump = function(){
//	
//	//t==0 si y solo si el salto termino, mario volvio al piso
//	if( this.jumpt == 0){
//		if(keydown.x){
//			this.h=this.h0;
//			this.k=this.k0;
//			this.j=1;
//			this.y = Math.pow(this.jumpt-this.h,2) + this.k;
//			this.jumpt++;	
//		}
//	};
//	
//	//condicion de corte
//	if(this.y == this.yp0 ){
//		if(!keydown.x){
//			this.jumpt=0;
//		}
//	};
//	
//	//completa el salto
//	if( this.jumpt>0){
//		this.y = Math.pow(this.jumpt-this.h,2) + this.k;
//		this.jumpt++;
//	};
//	//Si seguis apretando vas a saltar un poco mas.
//	if(this.jumpt>4 && this.jumpt<12){
//		if(keydown.x){
//			this.k = -15*this.j + this.k0;
//			this.h= Math.sqrt(this.yp0-this.k);
//			this.j++;
//		}
//	}
//};

//



	






// HACERLO POR EL OTRO METODO
//modelo de cargar imagenes
//var img = new Image();
//img.src = 'mario.png';
//img.onload = function(){
//	canvas.drawImage(img,0,0,20,50);
//	};
//---------------------------