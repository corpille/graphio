
jQuery('document').ready(function () {

  var graph = {
    name: '0',
    color: 'red',
    children: [
      {
        name: '1-1',
        color: 'blue',
        children: [
          {
            name: '3-1-1',
            color: 'green',
            children: []
          },
          {
            name: '3-1-2',
            color: 'green',
            children: []
          },
          {
            name: '3-1-3',
            color: 'green',
            children: []
          },
          {
            name: '3-1-4',
            color: 'green',
            children: []
          },
          {
            name: '3-1-5',
            color: 'green',
            children: []
          },
          {
            name: '3-1-6',
            color: 'green',
            children: []
          },
          {
            name: '3-1-7',
            color: 'green',
            children: []
          }
        ]
      },
      {
        name: '1-2',
        color: 'blue',
        children: [
          {
            name: '2-1',
            color: 'green',
            children: [

              {
                name: '3-1-1',
                color: 'purple',
                children: [
                  {
                    name: '4-2-1',
                    color: 'orange',
                    children: [
                      {
                        name: '5-1-1',
                        color: 'turquoise',
                        children: []
                      },
                      {
                        name: '5-1-2',
                        color: 'turquoise',
                        children: []
                      },
                      {
                        name: '5-1-3',
                        color: 'turquoise',
                        children: []
                      },
                      {
                        name: '5-1-4',
                        color: 'turquoise',
                        children: []
                      },
                      {
                        name: '5-1-5',
                        color: 'turquoise',
                        children: []
                      }
                    ]
                  },
                  {
                    name: '4-2-2',
                    color: 'orange',
                    children: []
                  }
                ]
              },
              {
                name: '3-1-2',
                color: 'purple',
                children: []
              },
              {
                name: '3-1-3',
                color: 'purple',
                children: []
              }
            ]
          },
          {
            name: '2-2',
            color: 'green',
            children: [

              {
                name: '3-2-1',
                color: 'purple',
                children: []
              },
              {
                name: '3-2-2',
                color: 'purple',
                children: []
              }
            ]
          }
        ]
      },
      {
        name: '1-3',
        color: 'blue',
        children: [
          {
            name: '2-1',
            color: 'green',
            children: []
          },
          {
            name: '2-2',
            color: 'green',
            children: []
          },
          {
            name: '2-3',
            color: 'green',
            children: []
          },
          {
            name: '2-4',
            color: 'green',
            children: []
          }
        ]
      }
    ]
  }

  Graphio.init(graph, 'graph');
});