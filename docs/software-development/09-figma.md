## basics

### Navigating the canvas

These are the basic shortcut to navigate the canvas


| tool       | shortcut |
| ---------- | -------- |
| move tool  | v        |
| hand tool  | h        |
| scale tool | k        |
|            |          |
|            |          |
|            |          |


### Shapes

You can create shapes with these shortcuts

| tool      | shortcut |
| --------- | -------- |
| rectangle | r        |
| oval      | o        |
| line      | l        |
|           |          |
|           |          |
|           |          |

However, you can combine them with these two keyboard presses into order to draw the shape differently:

- **shift**: locks aspect ratio to be 1:1 for shapes, or moves lines in 45 degree angles when drawing lines.
- **alt**: draws the shape from the center going out instead of an edge by default.

#### Ellipses

For ellipses, we can draw an inner ring, sweep out sectors, and rotate it to create interesting shapes.


![](https://i.imgur.com/8VVGGSD.jpeg)

#### Combining shapes

we are going to learn how to use the union, subtraction, and other exclusion operators.

This is the shape we'll start off with, two circles with the left on top of the right.

![](https://i.imgur.com/EQFGUPp.png)

**union**

Union joins the two shapes together, including overlapping parts.

![](https://i.imgur.com/bq3C9i6.png)


**subtraction**

subtraction removes the shape on top and also deletes $A \cap B$ :

![](https://i.imgur.com/tNV5y6f.png)

**intersection**

Intersection only includes the part of $A \cap B$, which is the overlapping part.

![](https://i.imgur.com/ydjWFB4.png)

**exclude**

the exclude operator takes A and B but excluding $A \cap B$, which is the part in which both circles overlap. It deletes that part.

![](https://i.imgur.com/Xjn1UOg.png)

**flatten**

The flatten tool combines both shapes by putting them both on the same layer. This has the effect of seeing the shapes as if they are on the same plane of existence:

![](https://i.imgur.com/6FwXVnj.png)


### plugins

- **iconify**: for icons


### Templates

Figma glass playground, IOS

```embed
title: "Figma"
image: "https://www.figma.com/file/z1yXyzc1bvaGMVSAHMCsXm/thumbnail?ver=thumbnails/468f7b67-3429-4c05-ba7f-48a10d2fcef0"
description: "Created with Figma"
url: "https://www.figma.com/design/z1yXyzc1bvaGMVSAHMCsXm/Glass-playground?node-id=0-1&p=f&m=draw"
favicon: ""
aspectRatio: "56.25"
```

