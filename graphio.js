var Graphio = (function () {
  var self = {};

  /// The graph tree
  var tree = {};

  /// Id of the container
  var containerId = containerId;

  /// Size of a node (in pixel)
  var nodeSize = 50;

  /// Size of the radius to position the children nodes (in pixel)
  var radius = 140;

  /// Shift of the selected node (in pixel)
  var sideDecalage = 100;

  /// Current expanded node
  var current;

  /// Parent of the current node (or null if root)
  var parent;

  /// List of the expanded node's id
  var expanded = ['0'];

  /// Counter require for the initialisation
  var idCount = 0;

  /// Width of the container
  var width;

  /// Height of the container
  var height;

  /// List of the drawn lines
  var lines = [];

  /// Temporary object used to store data for the timeouts
  var sav = {
    expand: {},
    ids: [],
    idLines: [],
    idsGrandParent: []
  };

  /// Initialise the library
  self.init = function (graph, id) {
    tree = graph;
    if (id[0] !== '#') {
      id = '#' + id;
    }
    containerId = id;
    height = $(containerId).height();
    width = $(containerId).width();
    defineIds(tree, 0);
    var lineContainer = $('<div id="line-container"></div>');
    lineContainer.css({
      width: width,
      height: height,
      position: 'absolute'
    })
    $(containerId).prepend(lineContainer);
    appendRoot(tree);
    current = tree;
    expand(current);
  }

  /// Handle a click on a node
  function onClick(event) {
    toggleClicks();
    event.stopImmediatePropagation();
    var brother = false;
    var target = event.currentTarget;
    var currentId = $(target).attr('id');
    var iExp = expanded.indexOf(currentId);
    var child = findById(tree, currentId);
    var index = findChildIndex(current, child.id);
    var currentRoot = findById(tree, expanded[0]);

    var currentStatus = {
      child: findById(tree, currentId),
      index: findChildIndex(current, child.id),
      currentRoot: findById(tree, expanded[0])
    }

    // If click on the current node or its grand-father
    if (current === child || expanded.length === 3 && iExp === 0) {
      toggleClicks(true);
      return;
    }

    // If click on the parent of the curren node
    if ((expanded.length === 3 && iExp === 1) || (expanded.length === 2 && iExp === 0)) {
      currentRoot = onClickParent(currentRoot);
    }

    // If click on a brother of the current node
    else if (current.children.indexOf(child) === -1 && parent && parent.children.indexOf(child) !== -1) {
      // If brother has children
      if (child.children.length > 0) {
        positionNode(parent, findChildIndex(parent, child.id), child);
        collapse(current);
        current = parent;
        brother = true;
        index = findChildIndex(current, child.id);
        expanded.splice(expanded.length - 1, 1);
      } else {
        /// TODO: Ouvrir autre chose
      }
    }

    // If click on a child of the current node
    if (current.children.indexOf(child) !== -1) {
      if (child.children.length > 0) {
        if (!brother) {
          positionNode(current, index, child);
        }
        expand(child);
        parent = current;
        current = child
        expanded.push(currentId);
        if (expanded.length === 4) {
          $(currentRoot.element).remove();
          expanded.splice(0, 1);
          currentRoot = findById(tree, expanded[0]);
          removeLine(currentRoot.id);
        }
        if (expanded.length === 3) {
          removeGrandParentChild(findById(tree, expanded[0]));
        }
      }
    }
    setTimeout(() => {
      centerGraph();
    }, 600)
  }

  /// Handles a click on the parent of the current node
  function onClickParent(currentRoot) {
    if (expanded.length === 3) {
      expand(currentRoot, currentRoot.children.indexOf(parent));
    }
    if (expanded.length === 3 && expanded[0] !== '0') {
      var newRoot = findParent(tree, expanded[0]);
      expanded = [newRoot.id].concat(expanded);
      appendRoot(newRoot, currentRoot);
      currentRoot = newRoot;
    }
    $(current.element).css({
      'left': current.offset.left - sideDecalage + 'px'
    });
    $("#line-" + current.id).css({
      'width': radius + 'px'
    });
    collapse(current);
    current = parent;
    expanded.splice(expanded.length - 1, 1);
    parent = findById(tree, expanded[expanded.length - 2]);
    return currentRoot;
  }

  /// Collapse a node
  function collapse(node) {
    node.node = [];
    $(node.element).css({
      'transform': 'none',
      'z-index': '100'
    })
    node.children.forEach((child) => {

      $('#' + child.id).css({
        top: node.offset.top + 'px',
        left: node.offset.left + 'px',
        opacity: '0'
      })
      $('#line-' + child.id).css({
        opacity: '0',
        width: '0'
      });

      sav.ids.push(child.id);
      setTimeout(() => {
        var id = sav.ids[0];
        $('#' + id).remove();
        $('#line-' + id).remove();

        removeLine(id);
        sav.ids.splice(0, 1);
      }, 300)
    });
  }

  /// Expand a node start width its children at position [index]
  function expand(node, index = 0) {
    var offset = node.offset;
    var angle = (node === tree) ? 0 : 50;
    var x;
    var y;
    sav.expand = {
      currentNode: node,
      offset: offset,
      pos: {}
    };
    var nb = 0;
    while (nb < node.children.length) {
      angle = (nb / (node.children.length / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
      x = (radius * Math.cos(angle)) + radius; // Calculate the x position of the element.
      y = (radius * Math.sin(angle)) + radius; // Calculate the y position of the element.

      if (expanded.indexOf(node.children[index].id) === -1) {

        createNode(node, index, x, y, angle, nb, offset);
      }

      index++;
      if (index > node.children.length - 1) {
        index = 0;
      }
      nb++;
    }
    drawLines(node);
    setTimeout(() => {

      node.children.forEach((child) => {
        $('#line-' + child.id).attr({
          opacity: '1'
        })
      });
    }, 500);
  }

  /// Add a node to the graph
  function createNode(node, index, x, y, angle, nb, offset) {
    var subNode = $('<div class="node sub-node"><label class="name">' + node.children[index].name + '</label></div>');
    node.children[index].element = subNode[0];
    subNode.attr('id', node.children[index].id);

    if (nb === 0) {
      node.children[index].current = true;
    } else {
      node.children[index].current = false;
    }

    subNode.css({
      'width': nodeSize + 'px',
      'height': nodeSize + 'px',
      'top': offset.top + 'px',
      'left': offset.left + 'px',
      'opacity': '0',
      'background-color': node.children[index].color
    })
    sav.expand.pos[index] = {
      x: (x - radius),
      y: (y - radius)
    };
    node.children[index].offset = {
      top: (offset.top + y - radius),
      left: (offset.left + x - radius),
      angle: angle
    };
    subNode.click(onClick);
    subNode.insertAfter('#line-container');
    setTimeout(() => {
      var index = parseInt(Object.keys(sav.expand.pos));
      var node = $(sav.expand.currentNode.children[index].element);
      node.css({
        'top': sav.expand.offset.top + sav.expand.pos[index].y + 'px',
        'left': sav.expand.offset.left + sav.expand.pos[index].x + 'px',
        'opacity': '1',
      });
      sav.expand.currentNode.children[index].offset.top = sav.expand.offset.top + sav.expand.pos[index.toString()].y;
      sav.expand.currentNode.children[index].offset.left = sav.expand.offset.left + sav.expand.pos[index.toString()].x;

      delete sav.expand.pos[index.toString()];

    }, 200);
  }

  /// Position a node to the right
  function positionNode(node, index, child) {
    var angle = 0, x, y, nb = 0;
    var offset = node.offset;
    var clockwise = current.offset.top - node.children[index].offset.top > 0;
    var currentPositionedIndex = node.children.findIndex((child) => {
      return child.current;
    })

    if (index === currentPositionedIndex) {
      return slidePositionnedNode(node, index);
    }

    while (nb < node.children.length) {
      angle = (nb / (node.children.length / 2)) * Math.PI;
      x = (radius * Math.cos(angle)) + radius;
      y = (radius * Math.sin(angle)) + radius;

      var decalage = 0;
      node.children[index].current = false;
      if (nb === 0) {
        node.children[index].current = true;
        decalage = sideDecalage;
      }

      $(node.children[index].element).css({
        'top': (offset.top + y - radius) + 'px',
        'left': (offset.left + x - radius + decalage) + 'px',
        'width': nodeSize + 'px',
        'height': nodeSize + 'px'
      });

      var newAngle = positionLine(node, index, clockwise, decalage);
      node.children[index].offset = {
        top: (offset.top + y - radius),
        left: (offset.left + x - radius + decalage),
        angle: newAngle
      };
      index++;
      if (index > node.children.length - 1) {
        index = 0;
      }
      nb++;
    }
  }

  /// Shif a positioned node to the right
  function slidePositionnedNode(node, index) {
    var elem = $(node.children[index].element);
    var newLeft = getPxValue(elem, 'left') + sideDecalage;
    elem.css({
      'left': newLeft + 'px'
    });
    $('#line-' + node.children[index].id).css({
      width: radius + sideDecalage
    });
    node.children[index].offset.left = newLeft;
    return;
  }

  /// Position the lines according to the nodes
  function positionLine(node, index, clockwise, decalage) {

    var line = $('#line-' + node.children[index].id)
    var newAngle = Math.round(node.children[index].offset.angle * 180 / Math.PI);
    if (clockwise) {
      newAngle += (360 / node.children.length);
    } else {
      newAngle -= (360 / node.children.length);
    }

    line.css({
      '-moz-transform': 'rotate(' + newAngle + 'deg)',
      '-webkit-transform': 'rotate(' + newAngle + 'deg)',
      '-o-transform': 'rotate(' + newAngle + 'deg)',
      '-ms-transform': 'rotate(' + newAngle + 'deg)',
      width: radius + decalage + 'px'
    })
    return newAngle * Math.PI / 180;
  }

  // Toggle clicks on the graph
  function toggleClicks(toggle) {
    $(containerId).css({
      'pointer-events': toggle ? 'all' : 'none'
    });
  }

  // Collapse grand-father node that are node expanded
  function removeGrandParentChild(node) {
    for (child of node.children) {
      if (expanded.indexOf(child.id) === -1) {
        $('#' + child.id).css({
          top: node.offset.top + 'px',
          left: node.offset.left + 'px',
          opacity: '0'
        })
        $('#line-' + child.id).css({
          opacity: '0',
          width: '0'
        });
        sav.idsGrandParent.push(child.id);
        setTimeout(() => {
          sav.idsGrandParent.forEach((id) => {
            $('#' + id).remove();
            removeLine(id);
          })
          sav.idsGrandParent = [];
        }, 300)
      }
    }
  }

  /// Restore or add a root to the graph
  function appendRoot(newRootNode, oldRootNode) {
    var newNode = $('<div class="node"><label class="name">' + newRootNode.name + '</label></div>');
    if (oldRootNode) {
      newRootNode.offset = {
        top: oldRootNode.offset.top,
        left: oldRootNode.offset.left - radius - sideDecalage,
        angle: 0
      };
    } else {
      newRootNode.offset = {
        top: ((height / 2) - (nodeSize / 2)),
        left: ((width / 2) - (nodeSize / 2)),
        angle: 0
      }
    }
    newNode.css({
      'top': newRootNode.offset.top + 'px',
      'left': newRootNode.offset.left + 'px',
      'background-color': newRootNode.color
    })
    newRootNode.element = newNode;
    newNode.attr('id', newRootNode.id);
    newNode.click(onClick);
    $(containerId).append(newNode);
    if (oldRootNode) {
      createNewLine(oldRootNode, newRootNode);
    }
  }

  /// Center the graph in the middle of the container
  function centerGraph() {
    var delta = calculateDeltaCenter();
    $('#graph .node').each((index, elem) => {
      var id = $(elem).attr('id');
      var node = findById(tree, id);
      if (Math.abs(delta.y) > 5) {
        node.offset.top = getPxValue(elem, 'top') - delta.y;
      }
      if (Math.abs(delta.x) > 5) {
        node.offset.left = getPxValue(elem, 'left') - delta.x;
      }
      $(elem).css({
        top: node.offset.top + 'px',
        left: node.offset.left + 'px'
      })
      if (lines.indexOf(id) !== -1) {
        var line = $('#line-' + id);
        if (Math.abs(delta.x) > 5) {
          line.css('left', getPxValue(line, 'left') - delta.x + 'px');
        }
        if (Math.abs(delta.y) > 5) {
          line.css('top', getPxValue(line, 'top') - delta.y + 'px');
        }
      }
    });
    toggleClicks(true);
  }

  /// Calculate the delta between the graph and the container's center
  function calculateDeltaCenter() {
    var bounding = {
      left: width,
      right: 0,
      top: height,
      bottom: 0
    };
    $('#graph .node').each((index, elem) => {
      var offset = $(elem).offset();
      if (offset.top < bounding.top) {
        bounding.top = offset.top;
      }
      if (offset.top + nodeSize > bounding.bottom) {
        bounding.bottom = offset.top + nodeSize;
      }
      if (offset.left < bounding.left) {
        bounding.left = offset.left;
      }
      if (offset.left + nodeSize > bounding.right) {
        bounding.right = offset.left + nodeSize;
      }
    });
    var size = {
      width: bounding.right - bounding.left,
      height: bounding.bottom - bounding.top,
    }
    return {
      x: bounding.left - ((width - size.width) / 2),
      y: bounding.top - ((height - size.height) / 2)
    }
  }

  /// Get the integer value of a pixel attibute
  function getPxValue(element, attribute) {
    return parseInt($(element).css(attribute).replace('px', ''));
  }

  /// Delete a line
  function removeLine(id) {
    $('#line-' + id).remove();
    var index = lines.indexOf(id);
    if (index !== -1) {
      lines.splice(index, 1);
    }
  }

  /// Search for the index of a node child by its id
  function findChildIndex(parent, id) {
    return parent.children.findIndex(function (child) {
      if (child.id === id) {
        return true;
      }
    });
  }

  /// Create a line element width its style
  function createLineElement(data) {
    var line = $('<div></div>');
    line.css({
      width: data.length + 'px',
      height: '1px',
      'background-color': '#949494',
      '-moz-transform': 'rotate(' + data.angle + 'deg)',
      '-webkit-transform': 'rotate(' + data.angle + 'deg)',
      '-o-transform': 'rotate(' + data.angle + 'deg)',
      '-ms-transform': 'rotate(' + data.angle + 'deg)',
      'transform': 'rotate(' + data.angle + 'deg)',
      'transition': 'all .5s',
      'position': 'absolute',
      'transform-origin': 'center left',
      top: data.y + 'px',
      left: data.x + 'px'
    });
    return line;
  }

  /// Create a new line between two nodes
  function createNewLine(node1, node2) {
    var x1 = node1.offset.left + (nodeSize / 2);
    var y1 = node1.offset.top + (nodeSize / 2);
    var x2 = node2.offset.left + (nodeSize / 2);
    var y2 = node2.offset.top + (nodeSize / 2);
    var a = x1 - x2;
    var b = y1 - y2;
    var length = Math.sqrt(a * a + b * b);
    var line = createLineElement({
      x: node2.offset.left + (nodeSize / 2),
      y: node2.offset.top + (nodeSize / 2),
      length: 0,
      angle: node1.offset.angle * 180 / Math.PI
    });
    $(line).attr('id', 'line-' + node1.id).appendTo('#line-container');
    sav.idLines.push(node1.id);
    lines.push(node1.id);
    setTimeout(() => {
      $("#line-" + sav.idLines[0]).css({
        width: length + 'px'
      });
      sav.idLines.splice(0, 1);
    }, 200);
  }

  /// Draw the ligne between a parent dans its children
  function drawLines(parent) {
    parent.children.forEach((child) => {
      if (lines.indexOf(child.id) === -1) {
        if ($('#line-' + child.id).length == 0) {
          createNewLine(child, parent);
        }
      }
    });
  }

  /// Initialise the graph element's ids
  function defineIds(node) {
    node.id = (idCount++).toString();
    if (node.children && node.children.length > 0) {
      for (var i = 0; i < node.children.length; i++) {
        var res = defineIds(node.children[i]);
      }
    }
  }

  /// Collapse all the expanded children node of a node
  function collapseAll(node) {
    if (node.children && node.children.length > 0 && expanded.indexOf(node.id) !== -1) {
      for (var i = 0; i < node.children.length; i++) {
        collapseAll(node.children[i]);
        collapse(node.children[i]);
      }
    }
  }

  /// Search a node by its id
  function findById(node, id) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      for (var i = 0; i < node.children.length; i++) {
        var res = findById(node.children[i], id);
        if (res !== null) {
          return res;
        }
      }
    }
    return null;
  }

  /// Search a node parent by the node id
  function findParent(node, id) {
    if (node.children && node.children.length > 0) {
      var index = node.children.findIndex((child) => {
        return child.id === id
      });
      if (index !== -1) {
        return node;
      }
      for (var i = 0; i < node.children.length; i++) {
        var res = findParent(node.children[i], id);
        if (res !== null) {
          return res;
        }
      }
    }
    return null;
  }
  return self;
})();