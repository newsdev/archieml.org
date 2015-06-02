+function() {
  'use strict';

  var branch;
  if (branch = location.search.match(/(?:&|\?)branch=([-_\w\/]+)(?:&|$)/)) {
    var my_awesome_script = document.createElement('script');
    my_awesome_script.setAttribute('src','/assets/branches/' + branch[1] + '.js');
    document.head.appendChild(my_awesome_script);
  }

  var amls = Array.prototype.slice.call(document.getElementsByTagName('aml'));
  amls.forEach(function(aml) {
    var div = document.createElement('div');
    div.setAttribute('class', 'example');
    div.appendChild(document.createElement('div'));
    div.appendChild(document.createElement('div'));
    div.children[0].appendChild(document.createElement('textarea'));
    div.children[1].appendChild(document.createElement('pre'));
    var content = aml.innerText || aml.childNodes[0].data;
    div.children[0].children[0].value = content.replace(/(^\n)|(\n$)/g, '');

    var parent = aml.parentNode;
    parent.insertBefore(div, aml.nextSibling);
    parent.removeChild(aml);

    var source = div.children[0].children[0];
    var destination = source.parentNode.parentNode.children[1].children[0];
    source.style['min-height'] = (source.scrollHeight + 2) + 'px';
    source.addEventListener('keyup', function(e) {
      destination.innerHTML = JSON.stringify(archieml.load(source.value), null, 2);
    });
    source.dispatchEvent(new Event('keyup'));
  });
}();
