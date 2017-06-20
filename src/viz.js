const vis = require('vis');

export default function generateVisualization(database) {
    /**
     * Load previous data.
     * This is a little dense, but process is:
     * - Get the db result (only once so it's immutable for now)
     * - Pull the value out of the result
     * - Start a reduce based on each visitor key
     *  - For each visitor key, create a node first.
     */
    database.ref('visits/').once('value')
      .then((result) => {
        return result.val();
      })
      .then((data) => {
        const userMap = Object.keys(data)
          .reduce((agg, visitorKey) => {
            agg[visitorKey] = Object.keys(data[visitorKey])
              .map((viewKey) => {
                return data[visitorKey][viewKey].hash
              });
            return agg;
          }, {});
        return Object.keys(data)
          .reduce((agg, visitorKey) => {
            /**
             * For each unique title, get a node. Nested reduce not idea but oh well.
             */
            const uniqueTitles = [...new Set(
              Object.keys(data[visitorKey]).map(visit => data[visitorKey][visit].p)
            )];
            uniqueTitles.reduce((agg, title) => {
              const viewKeys = Object.keys(data[visitorKey]);
              const viewsToTitle = viewKeys.map((key) => {
                if (title === data[visitorKey][key].p) {
                  return data[visitorKey][key];
                }
                return null;
              });
              const firstView = viewsToTitle.reduce(
                (first, view) => (
                  (!first && title === view.p) ? view : first
                ), null
              );
              let referringUser = false;
              Object.keys(userMap).forEach((user) => {
                if (Object.values(userMap[user]).includes(firstView.rU)) {
                  referringUser = user;
                }
              });
              if (!referringUser && !agg.nodes.find((node) => title === node.id)) {
                agg.nodes.push({
                  label: title,
                  id: title,
                  group: 'post',
                });
              }
              const source = (firstView.s && !firstView.s.includes(window.location.hostname)) ? firstView.s.split( '/' )[2] : 'direct';
              agg.nodes.push({
                title,
                id: visitorKey,
                label: visitorKey,
                group: source,
                referringUser,
                value: viewsToTitle.length,
                hashes: Object.values(viewsToTitle).map((view) => view.hash)
              });
              if (referringUser) {
                agg.edges.push(
                  {
                    from: referringUser,
                    to: visitorKey,
                    label: `${viewsToTitle.length} views via ${source}`,
                  },
                );
              } else {
                agg.edges.push(
                  {
                    from: title,
                    to: visitorKey,
                    dashes: true,
                    label: `${viewsToTitle.length} views via ${source}`,
                  },
                );
              }
              return agg;
            }, agg);
          return agg;
        }, {nodes: [], edges: []});
      })
      .then((transformed) => {
        console.log(transformed);
        const options = {
          layout: {
              hierarchical: {
                  direction: 'UD',
                  sortMethod: 'directed',
                  levelSeparation: 300,
                  nodeSpacing: 300,
              }
          },
          physics: false,
          groups: {
              post: {
                  shape: 'triangle',
                  color: '#FF9900' // orange
              },
              direct: {
                  shape: 'dot',
                  color: "#2B7CE9" // blue
              }
          }
        };
        new vis.Network(document.getElementById('viz'), transformed, options);
      })
      .catch((e) => {
        console.log(e);
      });
}