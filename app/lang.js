const fs = require('fs')

var langdata;
function getfile() {
  console.log(process.env.APPDATA);
  var langs = JSON.parse(fs.readFileSync(process.env.APPDATA+"\\stretchly\\config.json", 'utf8')).lang
  return JSON.parse(fs.readFileSync('./lang/'+langs+'.json', 'utf8'));
}
module.exports = {
  loadabout : function(){
    langdata = getfile()
    document.getElementById('adoutsecondtitle').innerHTML=langdata.about[0].adoutsecondtitle;
    document.getElementById('aboutmore').innerHTML=langdata.about[0].aboutmore;
    document.getElementById('aboutupdate').innerHTML=langdata.about[0].aboutupdate;
  },
  loadbreak : function(){
    langdata = getfile()
    document.getElementById('breaktitle').innerHTML=langdata.break[0].breaktitle;
    document.getElementById('close').innerHTML=langdata.break[0].close;
  },
  loadprocess : function(){
    langdata = getfile()
    var newvis = langdata.process[0].newvis
  },
  loadmicroidea : function(){
    langdata = getfile()
    var miidea0 = langdata.microbreakidea[0].a;
    var miidea1 = langdata.microbreakidea[0].b;
    var miidea2 = langdata.microbreakidea[0].c;
    var miidea3 = langdata.microbreakidea[0].d;
    var miidea4 = langdata.microbreakidea[0].e;
    var miidea5 = langdata.microbreakidea[0].f;
    var miidea6 = langdata.microbreakidea[0].g;
    var miidea7 = langdata.microbreakidea[0].h;
    var miidea8 = langdata.microbreakidea[0].i;
    var miidea9 = langdata.microbreakidea[0].j;
    var miidea10 = langdata.microbreakidea[0].k;
    var miidea11 = langdata.microbreakidea[0].l;
    var miidea12 = langdata.microbreakidea[0].m;
    module.exports = [
      { data: miidea0, enabled: true },
      { data: miidea1, enabled: true },
      { data: miidea2, enabled: true },
      { data: miidea3, enabled: true },
      { data: miidea4, enabled: true },
      { data: miidea5, enabled: true },
      { data: miidea6, enabled: true },
      { data: miidea7, enabled: true },
      { data: miidea8, enabled: true },
      { data: miidea9, enabled: true },
      { data: miidea10, enabled: true },
      { data: miidea11, enabled: true },
      { data: miidea12, enabled: true }
    ]
  },
  loadsetting : function(){
    langdata = getfile()
    document.getElementById('settingtitle').innerHTML=langdata.setting[0].settingtitle;
    document.getElementById('firsttext').innerHTML=langdata.setting[0].firsttext;
    document.getElementById('secondtext').innerHTML=langdata.setting[0].secondtext;
    document.getElementById('thtext').innerHTML=langdata.setting[0].thtext;
    document.getElementById('bfirsttext').innerHTML=langdata.setting[0].bfirsttext;
    document.getElementById('bevery').innerHTML=langdata.setting[0].bevery;
    document.getElementById('bminute').innerHTML=langdata.setting[0].bminute;
    document.getElementById('bthtext').innerHTML=langdata.setting[0].bthtext;
    document.getElementById('defaults').innerHTML=langdata.setting[0].defaults;
    document.getElementById('enabledmicrobreak').innerHTML=langdata.setting[0].enabledmicrobreak;
    document.getElementById('enabledbreak').innerHTML=langdata.setting[0].enabledbreak;
  },
  loadsetting2 : function(){
    langdata = getfile()
    document.getElementById('setting2title').innerHTML=langdata.setting2[0].setting2title;
    document.getElementById('aud').innerHTML=langdata.setting2[0].aud;
    document.getElementById('ad1').innerHTML=langdata.setting2[0].ad1;
    document.getElementById('ad2').innerHTML=langdata.setting2[0].ad2;
    document.getElementById('ad3').innerHTML=langdata.setting2[0].ad3;
    document.getElementById('ad4').innerHTML=langdata.setting2[0].ad4;
    document.getElementById('color').innerHTML=langdata.setting2[0].color;
    document.getElementById('color').innerHTML=langdata.setting2[0].color;
    document.getElementById('c1').innerHTML=langdata.setting2[0].c1;
    document.getElementById('c2').innerHTML=langdata.setting2[0].c2;
    document.getElementById('c3').innerHTML=langdata.setting2[0].c3;
    document.getElementById('c4').innerHTML=langdata.setting2[0].c4;
    document.getElementById('c5').innerHTML=langdata.setting2[0].c5;
    document.getElementById('defaults').innerHTML=langdata.setting2[0].defaults;
  },
  loadsetting3 : function(){
    langdata = getfile()
    document.getElementById('setting3title').innerHTML=langdata.setting3[0].setting3title;
    document.getElementById('other').innerHTML=langdata.setting3[0].other;
    document.getElementById('o1').innerHTML=langdata.setting3[0].o1;
    document.getElementById('o2').innerHTML=langdata.setting3[0].o2;
    document.getElementById('o3').innerHTML=langdata.setting3[0].o3;
    document.getElementById('defaults').innerHTML=langdata.setting3[0].defaults;
  }
};
