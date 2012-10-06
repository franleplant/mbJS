var juego = new Game();
var p1 = new Floor(0,4, "block",juego);
var p2 = new Viewable(200,200,30,30, "block",juego);

//esto es para player
//-------------------

var standL = new Face(0,0, 25,33);
//var riftL =  new Face(31,1,28,33);
//var walkL0 = new Face(97,0,28,33);
//var walkL1 = new Face(68, 0 ,24,33);
//var walkL2 = new Face(131,0,32,33);
//var jumpL = new Face(175,0,34,33)
////main, riftL, standL, ,jumpL
//var marioMini = [walkL0,walkL1, walkL2 ,walkL1]
//var p3 = new Animable(100,338,"mMini",juego,marioMini);

var m1 = new Moveable(200,0,"mMini",juego,  [standL]);
console.log(m1)


juego.lvls[0] = new Level("#5983FF", [p1,p2,m1])
juego.beginGame();
//console.log(juego);