/**
 * Menu.js:
 *
 * simple pop-up menu, to be used in D3 apps.
 *
 * Licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 3.0 License.
 * see http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * @author Barend Kobben - b.j.kobben@utwente.nl
 * @version 1.0 [December 2017]
 *
 */
// glovbal vars:
var menuDiv, menuWidth = menuHeight = 28;
var menuShowing = .85, menuHidden = 0.2;

/* initMenus(parentDiv)
  inits a menu  menu bar:
  parentDiv: [str] the DOM id of the div that the menu wil be in
  showAtStart: [bool] menu shown after init
 */
function initMenus(parentDiv, showAtStart) {
  //create menu div:
  menuDiv = d3.select("#" + parentDiv.id)
    .append("div")
    .attr("id", "menuDiv")
    .style("opacity", (showAtStart?menuShowing:menuHidden) )
    .on("click", function () {
      menuOpen();
    })
    .on("mouseover", function () {
      menuShow();
    })
    .on("mouseleave", function () {
      menuClose(showAtStart);
    })
  ;
  menuDiv.append("img")
    .attr("src", "Blue_globe_icon.png")
    .style("align","left")
    .on("mouseover", function () {
      menuShow();
    })
  ;
}

/* addSelectMenu(menuName, menuData, menuSelected)
 adds a Select menu to the menu bar:
 menuName:       [str] name used in menu bar and DOM
 menuFunction    [F] the function to trigger -- HAS to be a function that takes only
                 one integer (the index of the menu) as its single parameter!
 menuItems:      [array of str]: text for the options is set to menuItems[n],
                  values for the options are the array index [0..n]
 menuSelected:   [int] the option initially selected
 */
function addSelectMenu(menuName, menuFunction, menuItems, menuSelected) {
  //menuDiv.append("p")
  //  .attr("class", "menuName")
  //  .html(menuName + ":")
  //;
  var menuSelect = menuDiv.append("select")
    .attr("name", menuName)
    .on("change", function(d) {
      menuFunction(this.value)
    })
  ;
  menuSelect.selectAll("option")
    .data(menuItems)
    .enter().append("option")
    .attr("value", function (d,i) {return i } )
    .text(function (d) {return d; } )
    .attr("selected", function (d,i) {
      if (i == menuSelected) return "selected"; })
  ;
}

/* addButtonMenu(menuName, menuData, menuSelected)
 adds a button to the menu bar:
 menuName:       [str] name used in menu bar and DOM
 menuFunction    [F] the function to trigger
 */
function addButtonMenu(menuName, menuFunction) {
  var menuButton = menuDiv.append("button")
    .attr("name", menuName)
      .text(menuName)
    .on("click", function(d) {
      menuFunction()
    })
  ;
}

function menuShow() {
  menuDiv.transition()
    .duration(250)
    .style("opacity", menuShowing);
}

function menuOpen() {
  menuDiv.transition()
    .duration(250)
    //.style("width", menuWidth + "px")
    .style("width", "auto")
  ;
}

function menuClose(showAtStart) {
  menuDiv.transition()
    .duration(250)
    .style("width", menuHeight + "px")
    .style("opacity", (showAtStart?menuShowing:menuHidden) )
  ;
}