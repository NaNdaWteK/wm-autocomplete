class Autocomplete extends HTMLInputElement {
  constructor() {
    super();
    this._list = []
    this._container
    this._property = undefined
  }

  connectedCallback() {
    let autocompleteData = this.getAttribute('autocompletedata')
    if(autocompleteData){
      this._autoCompleteData = autocompleteData
      this._setDataNoEndpoint(autocompleteData)
      this._setProperty()
      this._prepareData()
      this._prepareContainer()
      this._autocompleteEvents()
    }
  }


  _autocompleteEvents() {
    this.addEventListener('keyup', function() {
      this._container.innerHTML = ''
      this._show()
    }.bind(this))
    this._closeClickOutsideContainer()
  }

  _prepareData() {
    if (this._isEndpoint()) {
      this._makeRequest()
    } else if (Array.isArray(this._autoCompleteData)) {
      this._addDataToList(this._autoCompleteData)
    } else {
      return;
    }
  }

  _makeRequest() {
    fetch(this._autoCompleteData)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      this._addDataToList(json)
    }.bind(this));
  }

  _show() {
    var matchedResults = this._matchData();
    if (this.value == "" || matchedResults.length == 0) {
        return;
    }
    this._showMatchs(matchedResults)
  }

  _matchData() {
    var reg = new RegExp(this.value.split('').join('\\w*').replace(/\W/, ""), 'i');
    return this._isMatchedResult(reg)
  }

  _isMatchedResult(reg){
    return this._list.filter(function(item) {
      if(this._hasProperty()){
        if(item[this._property].match(reg)){
          return item;
        }
      }else{
        if (item.match(reg)) {
          return item;
        }
      }
    }.bind(this))
  }

  _showMatchs(matchedResults) {
    matchedResults.forEach(function(item) {
      let paragraph = this._createItem(item)
      this._container.append(paragraph);
      this._toggleVisibility()
    }.bind(this));
  }

  _prepareContainer() {
    this._container = document.createElement('div')
    this._container.classList.add('autocomplete-results')
    document.querySelector(`.${this.getAttribute('parentclass')}`).appendChild(this._container)
  }

  _createItem(item) {
    let p = document.createElement('p')
    if(this._hasProperty()){
      let content = item.name
      p.textContent = this._prepareParagraphContent(content)
      p.dataset.value = content
    }else{
      p.textContent = this._prepareParagraphContent(item)
      p.dataset.value = item
    }
    this._addParagraphEvents(p)
    return p
  }

  _prepareParagraphContent(item) {
    let str = item
    if(str.length > 30) str = str.substring(0,30)+"..."
    return str
  }

  _addParagraphEvents(paragraph) {
    paragraph.addEventListener('click', function() {
      this.value = paragraph.dataset.value;
      this._toggleVisibility()
    }.bind(this))
    paragraph.addEventListener('mouseenter', function() {
        this.style.backgroundColor = "#BA9EB0";
    })
    paragraph.addEventListener('mouseleave', function() {
        this.style.backgroundColor = "#fff";
    })
  }

  _setProperty() {
    let property = this.getAttribute('propertydata')
    if(property){
      this._property = property
    }
  }

  _setDataNoEndpoint(data) {
    if(!this._isEndpoint()){
      this._autoCompleteData = JSON.parse(data)
    }
  }

  _addDataToList(data) {
    this._list = this._list.concat(data)
  }

  _toggleVisibility() {
    if(this._container.children.length > 0) {
      this._container.classList.add("visible")
    }else {
      this._container.classList.remove("visible")
    }
  }

  _closeClickOutsideContainer() {
    document.addEventListener('click', this._outsideClose.bind(this))
  }

  _outsideClose(event) {
    if (event.target != this._container && event.target != this ) {
      this._container.classList.remove("visible")
    }
  }

  _isEndpoint() {
    return this._autoCompleteData.includes('http')
  }

  _hasProperty() {
    return this._property !== undefined
  }
}

customElements.define('wm-autocomplete', Autocomplete, { extends: 'input' })
