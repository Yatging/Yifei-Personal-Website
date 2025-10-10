// 数据
const personHeight = 180;   // cm
const personWeight = 63.5;  // kg
const personBMI = (personWeight / ((personHeight / 100) ** 2)).toFixed(1);

// SVG 画布
const plotWidth = 500, plotHeight = 350;
const svgNew = d3.select("#vis-newplot")
    .append("svg")
    .attr("width", plotWidth)
    .attr("height", plotHeight);

// 图表标题
svgNew.append("text")
    .attr("x", plotWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("My Body Metrics Visualization");

// 身高图标（蓝色矩形）
svgNew.append("rect")
    .attr("x", 50)
    .attr("y", plotHeight - personHeight / 2 - 30) // 往上移一点
    .attr("width", 40)
    .attr("height", personHeight / 2)
    .attr("fill", "lightblue");

svgNew.append("text")
    .attr("x", 70)
    .attr("y", plotHeight - personHeight / 2 - 40)
    .attr("text-anchor", "middle")
    .text(`Height: ${personHeight} cm`);

// 体重图标（橙色圆）
svgNew.append("circle")
    .attr("cx", 200)
    .attr("cy", 220)
    .attr("r", personWeight / 5) // 缩放
    .attr("fill", "orange");

svgNew.append("text")
    .attr("x", 200)
    .attr("y", 280)
    .attr("text-anchor", "middle")
    .text(`Weight: ${personWeight} kg`);

// BMI 图标（圆点 + 颜色区间）
let bmiColor = "green";
let bmiText = "Normal";
if (personBMI < 18.5) {
    bmiColor = "blue";
    bmiText = "Underweight";
} else if (personBMI >= 25) {
    bmiColor = "red";
    bmiText = "Overweight";
}

svgNew.append("circle")
    .attr("cx", 350)
    .attr("cy", 180)
    .attr("r", 30)
    .attr("fill", bmiColor);

svgNew.append("text")
    .attr("x", 350)
    .attr("y", 185)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-weight", "bold")
    .text(`BMI ${personBMI}`);

// BMI 区间说明
svgNew.append("text")
    .attr("x", 350)
    .attr("y", 225)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", bmiColor)
    .text(bmiText);
