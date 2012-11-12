define([],function () {
    var simpo = {
        contains: function(text, test){
	    // summary:
	    //	Test whether one string is contained within an other.
	    // text: String
	    //	String to test (test subject).
	    // test: String
	    //	String to test for.
	    // return: Boolean
	
	    return ((text.toLowerCase().indexOf(test.toLowerCase()) == -1) ? false:true);
        },
        query: function(query, node){
	    // summary:
	    //	Wrapper function for dojo.query with some enhancements
	    // description:
	    //	Fixes certain Internet Explorer issues. Internet Explorer throws an error
	    //	if nothing is returned by dojo.query.  This is not very useful,
	    //	much better to return a blank array.  Function will also return
	    //	a nodeList, which includes a length method if one is not nativly
	    //	produced.  Queries for '>' will return all children rather than nothing
	    //	in IE and namespaces are accommodated to a degree (not a neat solution but
	    //	an effective and useful one).
	    // query: String
	    //	The query to submit to dojo.query.
	    // node: Object XMLnode/XMLDom
	    //	The node to start searching from.
	    // returns: Object XMLNodeList
            
	
	    var qry = new dojo.NodeList();
	    try { qry = dojo.query(query,node); } catch (e) { qry = new dojo.NodeList(); }
    
	    if ((dojo.trim(query) == '>') && (simpo.getListLength(qry) <= 0)) {
		try { var qry = dojo.query('*',node); } catch (e) { qry = new dojo.NodeList(); }
		if (simpo.getListLength(qry) > 0) { qry = simpo._getDirectChildNodes(qry,node); }
	    }
	
	    if (!(qry.hasOwnProperty("length"))) {
		qry.length = dojo.hitch(qry,simpo.getListLength,qry);
	    }
	
            if ((qry.length == 0) && (simpo.contains(query,':')) && (!simpo.contains(query,' '))) {
		qry = simpo._queryForNamespacedElements(query,node);
	    }
	
            return qry;
        },
        getListLength: function(nodes){
	    // summary:
	    //	Calculate the length of a nodelist (IE does not support the length method).
	    // nodes: Object XMLNodeList
	    //	The XML node list, which you need the length of.
	    // returns: Integer
	
	    if (nodes.hasOwnProperty("length")) {
		return nodes.length;
	    } else {
		var j = 0;
		    dojo.forEach(nodes,function(node,i) { j++; });
		    return j;   
	    }
        },
        _queryForNamespacedElements: function(query, node){
	    // summary:
	    //	Return a nodelist of all elements of a particular type in a particular namespace.
	    // description
	    //	This is a hack allow something like simpo.query("itunes:duration") to
	    //	return something useful, rather than a blank.
	    // query: String
	    //	The query to submit to dojo.query.
	    // node: Object XMLnode/XMLDom
	    //	The node to start searching from.
	    // returns: Object XMLNodeList
	
	    var nodes = simpo.query('*',node);
	    var qry = new dojo.NodeList();
	
	    if (nodes.length > 0) {
		dojo.forEach(nodes,function(cnode) {
		    if (this.isEqual(cnode.tagName,query)) {
			    qry.push(cnode);
		    }
		},this);
	    }
	
	    if (!(qry.hasOwnProperty("length"))) {
		qry.length = dojo.hitch(qry,simpo.getListLength,qry);
	    }
	
	    return qry;
        },
        _getDirectChildNodes: function(nodes, node){
	    // summary:
	    //	Filter a node list so it returns only direct children and not children's-children, ...etc.
	    // nodes: Object XMLNodeList
	    //	Nodes to filter.
	    // node: Object XMLNode
	    //	The parent node.
	    // returns: Object XMLNodeList
	
	    var qry = new dojo.NodeList();
	    dojo.forEach(nodes,function(cnode,i) {
		    if (simpo.getParentNode(cnode) == node) { qry.push(cnode); }
	    },this);
	    return qry
	},
        getParentNode: function(node){
	    // summary:
	    //	Get the node parent, no-matter, which browser is being used.
	    // node: Object XMLNode
	    //	Node to get parent of.
	    // returns: Object
		
	    try {
		return node.parentNode;
	    } catch(e) {
		try {
		    return node.parentElement;
		} catch(e) {
		    return null;
		}
	    }
        }
        
    };

    return simpo;
});