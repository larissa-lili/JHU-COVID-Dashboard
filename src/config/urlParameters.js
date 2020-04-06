let dictionaryHash = {};
let dictionaryArray = [];
export function writeStateToURL(state) {
    let date = new Date();
    const param = compressState(state);
    if (JSON.stringify(state) !== JSON.stringify(uncompressState(param))) {
        console.log("Error reviving state");
        console.log("original=" + JSON.stringify(state));
        console.log("revived=" +JSON.stringify(uncompressState(param)));
        return;
    }
    if (param.length < 2048) {
        //eslint-disable-next-line
        history.pushState(null, '', '?config=' + param);
    } else
        console.log("URL would be too long " + param.length);
    console.log("writeStateToURL took " + ((new Date()).getTime() - date.getTime()) + "ms; " + "length " + param.length);
}

export function getStateFromURL() {
    const config  = (new URLSearchParams(document.location.search)).get("config");
    if (!config)
        return undefined
    try {
        const state = uncompressState(config);
        if (typeof state.widgetBeingConfiguredId === 'undefined' ||
            typeof state.nextWidgetId === 'undefined' ||
            !(state.widgets instanceof Array))
            throw ("missing properties")
        else
            return state;
    } catch (e) {
        alert('Hmm there is a problem with config= in this URL ' + e.toString());
    }
}

function compressState (state) {
    const replacedState = JSON.parse(JSON.stringify(state, replacer));
    //eslint-disable-next-line
    return btoa(CJSON.stringify({dict: dictionaryHash, data: replacedState}));

}
function uncompressState(stateString) {
    //eslint-disable-next-line
    const uncompressedState = CJSON.parse(atob(stateString));
    dictionaryArray = [];
    Object.getOwnPropertyNames(uncompressedState.dict).map( dict => {
        const key = uncompressedState.dict[dict];
        dictionaryArray[key] = isNaN(dict) ? dict : dict * 1;
    });
    return JSON.parse(JSON.stringify(uncompressedState.data), reviver)
}

function replacer(key, value) {
     if (typeof value === "string" || typeof value === "number") {
        let newValue;

        if (typeof dictionaryHash[value] === 'undefined') {
            newValue = (dictionaryArray.length + 1);
            dictionaryHash[value] = dictionaryHash[value] || newValue
            dictionaryArray.push(value);
        } else
            newValue = dictionaryHash[value];
        return newValue;
    } else
        return value;
}
function reviver (key, value) {
        if (typeof value === "number")
            return dictionaryArray[value]
        else
            return value;
}


    /**
 By Steve Hanov
 Released to the public domain


 */

/* CJSON.stringify() to convert from objects to string
   CJSON.parse() to convert from string to objects.
  More documentation is pending.
*/

(function(){
    /*jslint sub: true */

    // We keep track of object types that we have seen in a tree.
    function Node( parent, key )
    {
        this.parent = parent;
        this.key = key;
        this.children = [];
        this.templateIndex = null;
        this.links = [];
    }

    Node.prototype.follow = function( key )
    {
        if ( key in this.children ) {
            return this.children[key];
        } else {
            this.children[key] = new Node( this, key );
            return this.children[key];
        }
    };

    // Given the root of the key tree, process the value possibly adding to the
    // key tree.
    function process( root, value )
    {
        var result;
        var i;
        var key;
        var node;

        if ( typeof value === "object" ) {
            // if it's an array,
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                // process each item in the array.
                result = [];
                for( i = 0; i < value.length; i++ ) {
                    result.push( process( root, value[i] ) );
                }
            } else {
                node = root;
                result = { "":[] };
                // it's an object. For each key,
                for (key in value) {
                    if ( Object.hasOwnProperty.call( value, key ) ) {
                        // follow the node.
                        node = node.follow( key );

                        // add its value to the array.
                        result[""].push( process( root, value[key] ) );
                    }
                }

                node.links.push( result );
            }
        } else {
            result = value;
        }

        return result;
    }

    // Given the root of the key tree, return the array of template arrays.
    function createTemplates( root )
    {
        var templates = [];
        var queue = [];
        var node;
        var template;
        var cur;
        var i;
        var key;
        var numChildren;

        root.templateIndex = 0;

        for ( key in root.children ) {
            if ( Object.hasOwnProperty.call( root.children, key ) ) {
                queue.push( root.children[key] );
            }
        }

        // while queue not empty
        while( queue.length > 0 ) {
            // remove a ode from the queue,
            node = queue.shift();
            numChildren = 0;

            // add its children to the queue.
            for ( key in node.children ) {
                if ( Object.hasOwnProperty.call( node.children, key ) ) {
                    queue.push( node.children[key] );
                    numChildren += 1;
                }
            }

            // if the node had more than one child, or it has links,
            if ( numChildren > 1 || node.links.length > 0 ) {
                template = [];
                cur = node;

                // follow the path up from the node until one with a template
                // id is reached.
                while( cur.templateIndex === null ) {
                    template.unshift( cur.key );
                    cur = cur.parent;
                }

                template.unshift( cur.templateIndex );

                templates.push( template );
                node.templateIndex = templates.length;

                for( i = 0; i < node.links.length; i++ ) {
                    node.links[i][""].unshift( node.templateIndex );
                }
            }
        }

        return templates;
    }

    function Compress( value )
    {
        var root, templates, values;

        root = new Node( null, "" );
        values = process( root, value );
        templates = createTemplates( root );

        if ( templates.length > 0 ) {
            return JSON.stringify( { "f": "cjson", "t": templates,
                "v": values }, null, null );
        } else {
            // no templates, so no compression is possible.
            return JSON.stringify( value );
        }
    }

    function getKeys( templates, index )
    {
        var keys = [];

        while( index > 0 ) {
            keys = templates[index-1].slice( 1 ).concat( keys );
            index = templates[index-1][0];
        }

        return keys;
    }

    function expand( templates, value )
    {
        var result, i, key, keys;

        // if it's an array, then expand each element of the array.
        if ( typeof value === 'object' ) {
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                result = [];
                for ( i = 0; i < value.length; i++ ) {
                    result.push( expand( templates, value[i] ) );
                }

            } else {
                // if it's an object, then recreate the keys from the template
                // and expand.
                result = {};
                keys = getKeys( templates, value[""][0] );
                for( i = 0; i < keys.length; i++ ) {
                    result[keys[i]] = expand( templates, value[""][i+1] );
                }
            }
        } else {
            result = value;
        }

        return result;
    }

    function Expand( str )
    {
        var value = JSON.parse( str );
        if ( typeof value !== "object" ||
            !("f" in value) ||
            value["f"] !== "cjson" )
        {
            // not in cjson format. Return as is.
            return value;
        }

        return expand( value["t"], value["v"] );
    }

    window.CJSON = {};
    window.CJSON.stringify = Compress;
    window.CJSON.parse = Expand;

})();
