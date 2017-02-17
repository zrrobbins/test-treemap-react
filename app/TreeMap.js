import React from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import $ from "jquery";

export default class Treemap extends React.Component {
  constructor(props) {
    super(props);

    this.margin = {top: 30, right: 0, bottom: 20, left: 0};
    this.width = this.props.divWidth - 25;
    this.height = 540 - this.margin.top - this.margin.bottom;
    this.formatNumber = d3.format(",%");
    this.rootname = "TOP";
    this.title = "";
    this.transitioning = false;

    this.d = this.props.data;
    this.d.x = this.d.y = 0;
    this.d.dx = this.width;
    this.d.dy = this.height;
    this.d.depth = 0;

    this.color = d3.scale.category20c();

    this.x = d3.scale.linear()
      .domain([0, this.width])
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .domain([0, this.height])
      .range([0, this.height]);

    this.accumulate = this.accumulate.bind(this);
    this.layout = this.layout.bind(this);
    this.display = this.display.bind(this);

    this.text = this.text.bind(this);
    this.text2 = this.text2.bind(this);
    this.rect = this.rect.bind(this);
    this.name = this.name.bind(this);

    this.transition = this.transition.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      divWidth: nextProps.divWidth
    });
  }

  componentDidMount() {
    this.svg = d3.select(ReactDOM.findDOMNode(this))
      .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.bottom + this.margin.top)
        .attr("id", "svgID")
        .style("margin-left", - this.margin.left + "px")
        .style("margin.right", - this.margin.right + "px");

    this.container = this.svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .style("shape-rendering", "crispEdges");

    this.grandparent = this.container.append("g")
      .attr("class", "grandparent")
      .attr("id", "gpID");

    this.grandparent.append("rect")
      .attr("y", -this.margin.top)
      .attr("width", this.width)
      .attr("height", this.margin.top);

    this.grandparent.append("text")
      .attr("x", 6)
      .attr("y", 6 - this.margin.top)
      .attr("dy", ".75em");

    this.treemap = d3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d._children; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(this.height / this.width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);

  
    this.accumulate(this.d);
    this.layout(this.d);
    this.display();
  }

  text(text) {
    var x = d3.scale.linear()
        .domain([0, this.width])
        .range([0, this.width]);
    var y = d3.scale.linear()
      .domain([0, this.height])
      .range([0, this.height]);

    text.selectAll("tspan")
      .attr("x", function(d) { return x(d.x) + 6; })
    text.attr("x", function(d) { return x(d.x) + 6; })
      .attr("y", function(d) { return y(d.y) + 6; })
      .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
  }

  text2(text) {
    var x = d3.scale.linear()
      .domain([0, this.width])
      .range([0, this.width]);
    var y = d3.scale.linear()
      .domain([0, this.height])
      .range([0, this.height]);

    text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
      .attr("y", function(d) { return y(d.y + d.dy) - 6; })
      .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
  } 
    

  rect(rect) {
    var x = d3.scale.linear()
      .domain([0, this.width])
      .range([0, this.width]);
    var y = d3.scale.linear()
      .domain([0, this.height])
      .range([0, this.height]);

    rect.attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y); })
      .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
      .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
  }

  name(d) {
    var formatNumber = d3.format(",%");

    return d.parent
      ? name(d.parent) + " / " + d.key + " (" + this.formatNumber(d.value) + ")"
      : d.key + " (" + this.formatNumber(this.d.value) + ")";
  }

  accumulate(d) {
    var self = this;
    return (d._children = d.values)
      ? d.value = d.values.reduce(function(p, v) { return p + self.accumulate(v); }, 0)
          : d.value;
  }

  
  layout(d) {
    var self = this;
    if (d._children) {
      this.treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        console.log(c);
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        self.layout(c);
      });
    }
  }


  display() {
    var formatNumber = d3.format(",%");
    var color = d3.scale.category20c();

    this.grandparent
        .datum(this.d.parent)
        .on("click", this.transition)
      .select("text")
        .text(this.name(this.d));

    console.log(this.svg);

    this.g1 = this.container.insert("g", ".grandparent")
      .datum(this.d)
      .attr("class", "depth");

    var g = this.g1.selectAll("g")
      .data(this.d._children)
      .enter().append("g");

    console.log(this.d);

    g.filter(function(d) { console.log(d); })
    g.filter(function(d) { return d._children; })
      .classed("children", true)
      .on("click", this.transition);

    var children = g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("g");

    children.append("rect")
        .attr("class", "child")
        .call(this.rect)
      .append("title")
      .text(function(d) { return d.key + " (" + formatNumber(d.value) + ")"; });
    children.append("text")
      .attr("class", "ctext")
      .text(function(d) { return d.key; })
      .call(this.text2);

    g.append("rect")
      .attr("class", "parent")
      .call(this.rect);

    var t = g.append("text")
      .attr("class", "ptext")
      .attr("dy", ".75em")

    t.append("tspan")
      .text(function(d) { return d.key; });
    t.append("tspan")
      .attr("dy", "1.0em")
      .text(function(d) { return formatNumber(d.value); });
    t.call(this.text);

    g.selectAll("rect")
      .style("fill", function(d) { return color(d.key); });

    return g;
  }

  transition() {
    if (this.transitioning || !this.d) return;
      this.transitioning = true;

    var svg = d3.select("svg");

    console.log(this);
    console.log('hihi');

    var g2 = this.display(),
        t1 = this.g1.transition().duration(750),
        t2 = g2.transition().duration(750);

    // Update the domain only after entering new elements.
    this.x.domain([this.d.x, this.d.x + this.d.dx]);
    this.y.domain([this.d.y, this.d.y + this.d.dy]);

    // Enable anti-aliasing during the transition.
    svg.style("shape-rendering", null);

    // Draw child nodes on top of parent nodes.
    svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

    // Fade-in entering text.
    g2.selectAll("text").style("fill-opacity", 0);

    // Transition to the new view.
    t1.selectAll(".ptext").call(this.text).style("fill-opacity", 0);
    t1.selectAll(".ctext").call(this.text2).style("fill-opacity", 0);
    t2.selectAll(".ptext").call(this.text).style("fill-opacity", 1);
    t2.selectAll(".ctext").call(this.text2).style("fill-opacity", 1);
    t1.selectAll("rect").call(this.rect);
    t2.selectAll("rect").call(this.rect);

    // Remove the old node when the transition is finished.
    t1.remove().each("end", function() {
      svg.style("shape-rendering", "crispEdges");
      this.transitioning = false;
    });
  }
  

  render() {
    return (
      <svg></svg>
    );
  }
}