Ext.Base.override({
    constructor : function () {
        this.callParent(arguments);

        DepVisualizer.onClassInstantiated(this);
    }
});

DepVisualizer = {
    cnt : 0,

    objects : {},

    links : [],

    onClassInstantiated : function (instance) {
        this.objects[this.cnt++] = instance;
    },

    ignoreRe : '^Ext',

    scan : function () {
        var objects = this.objects;
        var me = this;

        // Scan all found objects
        for (var id in objects) {
            var obj = objects[id];

            // For found "obj" look at each property in the object, and then look at objects in the cache to find links
            me.forEachComplexValueInObject(obj, function (key, value) {
                // Scan all other objects to find a property same as this

                for (var otherId in objects) {
                    var otherObj = objects[otherId];

                    if (obj !== otherObj && value === otherObj) {
                        me.links.push({
                            from : otherId,
                            to   : id
                        })
                    }
                }
            });
        }

        this.visualize();
    },

    forEachComplexValueInObject : function (obj, fn) {
        for (var prop in obj) {
            var val = obj[prop];
            var type = typeof(val);

            if (val && prop !== 'scope' &&
                prop !== 'owner' &&
                prop !== 'ownerCt' &&
                obj.$className &&
                obj.hasOwnProperty(prop) && type === 'object') {
                fn(prop, obj[prop]);
            }
        }
    },

    getIdByObject : function (obj) {
        var objects = this.objects;

        for (var id in objects) {
            if (objects[id] === obj) return id;
        }
    },

    visualize : function () {
        var objects = this.objects;
        var me = this;
        var nodes = Object.keys(objects).map(function (id) {
            return { id : id, label : ((objects[id] instanceof Ext.Component ? 'View: ' : '') + objects[id].$className) };
        });

        // create an array with edges
        // create a network
        var data = {
            nodes : nodes,
            edges : me.links
        };

        var options = {
            edges: {
                width: 2,
                style: 'arrow',
                color: 'gray'
            },
            nodes: {
                // default for all nodes
                fontFace: 'times',
                shape: 'circle',
                color: {
                    border: 'orange',
                    background: 'yellow',
                    highlight: {
                        border: 'darkorange',
                        background: 'gold'
                    }
                }
            },
            groups: {
                black: {
                    // defaults for nodes in this group
                    radius: 15,
                    color: 'black',
                    fontColor: 'white',
                    fontSize: 18,
                    fontFace: 'courier',
                    shape: 'rect'
                },
                gray: {
                    color: {
                        border: 'black',
                        background: 'gray',
                        highlight: {
                            border: 'black',
                            background: 'lightgray'
                        }
                    },
                    fontSize: 18,
                    fontFace: 'arial',
                    shape: 'circle'
                },
                white: {
                    color: {
                        border: 'black',
                        background: 'white'
                    },
                    fontColor: 'red',
                    shape: 'image',
                    image: 'img/soft-scraps-icons/User-Coat-Blue-icon.png'
                }
            }
        };

        var network = new vis.Network(document.getElementById('graph'), data, options);

    }
};

