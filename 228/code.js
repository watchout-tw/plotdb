{
  sample: function() {
    return {
      value: [{name: "Value", data: [1,2,3,4,5]}]
    };
  },
  dimension: {
    value: { type: [plotdb.Number], require: true, desc: "" }
  },
  config: {
    fontSize: {},
    fontFamily: {},
    tile: {
      name: "Map Tile", type: [plotdb.String], default: "",
      desc: "Map Tile URL for Leaflet URL",
      rebindOnChange: true,
    }
  },
  init: function() {
	var that = this;
    var container, short_container;
    var isSeeAll = false;
    this.m2h = new showdown.Converter();
    var result = this.m2h.makeHtml(this.root.innerHTML);
    this.id = "id" + (Math.random() * 1000000).toString(16);
    this.map = d3.select(this.root).append("div");
    this.story = d3.select(this.root).append("div");
    this.panel = d3.select(this.root).append("div").attr({
      id: "panel228",
      class: "first-panel"
    });
    this.panelInner = this.panel.append("div");
    this.panelSeeMore = this.panel.append("div");
    this.panelCtrl = this.panel.append("div");
    this.panelCtrl.attr({
      class: "story-button-group",
    });
    this.curBlock = 0;

    function hide () {
      that.panelInner[0][0].removeChild(that.panelInner[0][0].childNodes[0]);
      that.panelInner[0][0].appendChild(that.shortblocks[that.curBlock]);
      d3.select("div #see-more-btn").text("展開全文");
      d3.select("div #see-more-btn").on("click", function(d,i) {
        seeall(that.curBlock);
      });
      isSeeAll = false;
    }

    function seeall (idx) {
      if (that.blocks[that.curBlock].childNodes.length === that.shortblocks[that.curBlock].childNodes.length) {
        return;
      }
      that.panelInner[0][0].removeChild(that.panelInner[0][0].childNodes[0]);
      that.panelInner[0][0].appendChild(that.blocks[that.curBlock]);
      d3.select("div #see-more-btn").text("隱藏");
      d3.select("div #see-more-btn").on("click", function () {
        hide();
      });
      isSeeAll = true;
    }

    function theend () {
      that.panel.remove();
      that.end = d3.select(that.root).append("div")
        .attr({class: "the-end"});
      that.diemap = that.end.append("div")
      	.attr({style: "text-align: center"})
        .append("img")
        .attr("src", "https://cdn.musou.tw/uploads/images/2740/a2d00f4c-365a-47bd-8439-db03cc64e6ab.jpeg");
      that.victim = that.end.append("div")
      	.append("img")
      	.attr("src", "https://cloud.githubusercontent.com/assets/26052751/23348893/463323bc-fce9-11e6-9e2d-1d85436d7f81.jpeg");
    }

    function moveTo(idx) {
      if (idx > 0) {
      	d3.select("div #panel228").attr({class: "story-panel"});
      }
      if (isSeeAll) {
        hide();
      }

      var block;
      idx = (idx + that.blocks.length)%that.blocks.length;
      if (idx > 1) {
      	d3.select("div #prev").attr({style: "background: #fff;"}).on("click", function () {
          moveTo(that.curBlock - 1);
        });
      } else {
        d3.select("div #prev").attr({style: "display: none"});
      }
      if (idx === that.blocks.length -1) {
        d3.select("div #next").text("三月大屠殺開始⋯").on("click", function () {
		  theend();
        }).attr({
          style: "font-size: 0.9em"
        });
      } else if (idx > 0) {
        d3.select("div #next").text("下一站 > ").on("click", function () {
          moveTo(that.curBlock + 1);
        }).attr({
          style: "font-size: 0.9em"
        });
      }
      d3.select("div #see-more-btn").attr({style: "background: #fff;"})
      that.panelInner[0][0].removeChild(that.panelInner[0][0].childNodes[0]);
      that.curBlock = idx;
      block = that.shortblocks[that.curBlock];
      that.panelInner[0][0].appendChild(block);
      that.map.panTo([block.lat, block.lng]);
      L.marker([block.lat, block.lng]).addTo(that.map);
      if(block.zoom) {
        that.map.setZoom(block.zoom);
      }
      if (that.blocks[that.curBlock].childNodes.length === that.shortblocks[that.curBlock].childNodes.length) {
        d3.select("div #see-more-btn").attr({style: "display: none"});
      }
      window.scrollTo(0, 0);
    }

    this.seeall = seeall;
    this.moveTo = moveTo;
    this.panelCtrlPrev = this.panelCtrl.append("div").attr({
      id: "prev",
      class: "story-button"
    }).text(" < 上一站").on("click", function(d,i) {
      // moveTo(that.curBlock - 1);
    });
    this.panelCtrlNext = this.panelCtrl.append("div").attr({
      id: "next",
      class: "story-button",
      style: "font-size: 1.2em;"
    }).text("回到七十年前的台灣 >").on("click", function(d,i) {
      moveTo(that.curBlock + 1);
    });
    this.story.style({
      background: "#fff",
      position: "absolute",
      "z-index": 100
    }).html(result);
    var id;
    var nodelist = [];
    var story = this.story[0][0];
    // story 是讀進來的 html 資料，看不到的
    this.blocks = [];
	this.shortblocks = [];
    var prevIsH2 = false;
    for(i=0; i<story.children.length; i++) {
      nodelist.push(story.children[i]);
    }
    // parse document
    for(var count=1,i=0, shortcount=1; i<nodelist.length; i++) {
      node = nodelist[i];
      if(node.tagName.toLowerCase() == "h2" && /\(([0-9., ]+)\)\s*$/.exec(node.innerText)) {
        var lat, lng, zoom;
        var latlng = /\(([0-9. ]+),([0-9. ]+),?([0-9. ]+)?\)\s*$/.exec(node.innerText);
        if(!latlng) continue;
        lat = latlng[1];
        lng = latlng[2];
        zoom = latlng[3];
        node.innerText = node.innerText.replace(/\([0-9,. ]+\)\s*$/,"");
        container = document.createElement("div");
        container.className = "block";
        container.id = "block" + count;
        this.blocks.push(container);
        container.lat = lat;
        container.lng = lng;
        container.zoom = zoom;
        count++;
        short_container = document.createElement("div");
        short_container.className = "block";
        short_container.id = "shortblock" + shortcount;
		this.shortblocks.push(short_container);
        short_container.lat = lat;
        short_container.lng = lng;
        short_container.zoom = zoom;
        shortcount++;
        prevIsH2 = true;
      }

      if (container) {
        story.removeChild(node);
        container.appendChild(node);
      }
      if (short_container) {
        if (node.tagName.toLowerCase() === "h2") {
          var temp = node.cloneNode(true);
          short_container.appendChild(temp);
        }
        if (node.tagName.toLowerCase() === "p" && prevIsH2) {
          var temp = node.cloneNode(true);
          short_container.appendChild(temp);
          prevIsH2 = false;
        }
      }
    }
    this.panelInner[0][0].appendChild(this.shortblocks[0]);
    this.panelSeeMoreBtn = this.panelSeeMore.append("div").attr({
      class: "middle-btn",
      id: "see-more-btn"
    }).text("展開全文").on("click", function(d,i) {
      seeall(that.curBlock);
    });
    this.map.attr({
      id: this.id,
    }).style({
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%"
    });
  },
  parse: function() {
    var that = this;
  },
  bind: function() {
    var that = this;
    this.map = L.map(this.id);
    this.map.scrollWheelZoom.disable();
    L.tileLayer(this.config.tile, {attribution: "Mapbox"}).addTo(this.map);
    this.moveTo(0);
  },
  resize: function() {
    var that = this;
    var box = this.root.getBoundingClientRect();
    var width = this.width = box.width;
    var height = this.height = box.height;
    d3.select(this.root).style({
      "font-size": this.config.fontSize,
      "font-family": this.config.fontFamily
    });
  },
  render: function() {
    var that = this;
  }
}
