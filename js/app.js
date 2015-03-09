(function ($) {

	_.templateSettings = {
	  interpolate: /\{\{(.+?)\}\}/g
	};

	var contacts = [
		{name: "Contact 1", address: "156, Sir Virgile Naz Avenue, Quatre-Bornes, MUR", tel: "0123456789", email: "pauloladimeji@gmail.com", type: "family"},
		{name: "Contact 1", address: "156, Sir Virgile Naz Avenue, Quatre-Bornes, MUR", tel: "0123456789", email: "pauloladimeji@gmail.com", type: "friend"},
		{name: "Contact 1", address: "156, Sir Virgile Naz Avenue, Quatre-Bornes, MUR", tel: "0123456789", email: "pauloladimeji@gmail.com", type: "family"},
		{name: "Contact 1", address: "156, Sir Virgile Naz Avenue, Quatre-Bornes, MUR", tel: "0123456789", email: "pauloladimeji@gmail.com", type: "colleague"},
		{name: "Contact 1", address: "156, Sir Virgile Naz Avenue, Quatre-Bornes, MUR", tel: "0123456789", email: "pauloladimeji@gmail.com", type: "family"},
		{name: "Contact 1", address: "156, Sir Virgile Naz Avenue, Quatre-Bornes, MUR", tel: "0123456789", email: "pauloladimeji@gmail.com", type: "friend"}
	
	];
	
	//contact model
	var Contact = Backbone.Model.extend({
		defaults: {
			photo: "./img/placeholder.png",
			name: "",
			address: "",
			tel: "",
			email: "",
			type: ""
		}
	});

	//directory collection
	var Directory = Backbone.Collection.extend({
		model: Contact
	});


	//individual Contact View
	var ContactView = Backbone.View.extend({
		tagName: "article",
		className: "contact-container",
		template: _.template($("#contactTemplate").html()),

		render: function () {
			//var tmpl = _.template(this.template);

			this.$el.html(this.template(this.model.toJSON()));
			return this; //convention, so that ContactView render() can be reused in a parent view...
		},

		events: {
			"click button.delete": "deleteContact" //events hash
		},


		//due to the use of the eevents hash above, "this" within the below callback refers to any instance of ContactView.
		deleteContact: function() {
			var removedType = this.model.get("type").toLowerCase();

			this.model.destroy();

			this.remove();

			if(_.indexOf(directory1.getTypes(), removedType) === -1) {
				directory1.$el.find("#filter select").children("[value='" + removedType + "']").remove();
			}
		}
	});


	//master view
	var DirectoryView = Backbone.View.extend({
		el: $("#contacts"),

		initialize: function () {
			this.collection = new Directory(contacts);
			
			this.render();
			this.$el.find("#filter").append(this.createSelect());
			this.on("change:filterType", this.filterByType, this);
			this.collection.on("reset", this.render, this);
			this.collection.on("add", this.renderContact, this);
			this.collection.on("remove", this.removeContact, this);
		},

		render: function () {
			this.$el.find("article").remove(); //remove current list
			//var that = this;
			_.each(this.collection.models, function (item) {
				this.renderContact(item);
			}, this);
		},

		renderContact: function (item) {
			var contactView = new ContactView({model: item});
			this.$el.append(contactView.render().el);
		},

		getTypes: function () {
			return _.uniq(this.collection.pluck("type"));
		},

		createSelect: function () {
			//var filter = this.$el.find("#filter");
			var select = $("<select>", {
				html: "<option value='all'>All</option>"
			});

			_.each(this.getTypes(), function (item) {
				var option = $("<option/>", {
					value: item,
					text: item.charAt(0).toUpperCase() + item.substr(1)
				}).appendTo(select);
			});

			return select;
		},


		//ui events
		events: {
			"change #filter select": "setFilter",

			"click #add": "addContact",
			'click #showForm': "showForm"
		},

		setFilter: function(e) {
			this.filterType = e.currentTarget.value;
			this.trigger("change:filterType");
		},

		filterByType: function () {
			if (this.filterType === "all") {
				this.collection.reset(contacts);
				contactsRouter.navigate("filter/all");
			} 
			else {
				this.collection.reset(contacts, {silent: true});

				var filterType = this.filterType,
					filtered = _.filter(this.collection.models, function (item) {
						return item.get("type") === filterType;
					});

				this.collection.reset(filtered);

				contactsRouter.navigate("filter/" + filterType);
			}
		},

		/*addContact: function (e) {
			e.preventDefault();
			this.collection.reset(contacts, {silent: true});

			var newModel = {};
			$("#addContact").children("input").each(function(i, el) {
				if ($(el).val() !== "") {
					console.log(el);
					newModel[el.id] = $(el).val();
				}
			});

			contacts.push(newModel);

			this.collection.add(new Contact(newModel));
			if(_.indexOf(this.getTypes(), newModel.type) === -1) {
				this.$el.find("#filter").find('#select').remove().end().append(this.createSelect);
			}
			//this.filterType = newModel.type.toLowerCase();
			//this.filterByType();
		},*/

		addContact: function (e) {
		    e.preventDefault();
		 
		    var newModel = {};
		    $("#addContact").children("input").each(function (i, el) {
		        if ($(el).val() !== "") {
		            newModel[el.id] = $(el).val();
		        }
		    });
		    for (var prop in newModel) {
		    	if (newModel.hasOwnProperty(prop)) {
		    		console.log(newModel[prop]);
		    	}
		    }
		 
		    contacts.push(newModel);
		 
		    if (_.indexOf(this.getTypes(), newModel.type) === -1) {
		        this.collection.add(new Contact(newModel));
		        this.$el.find("#filter").find("select").remove().end().append(this.createSelect()); 
		    } else {
		        this.collection.add(new Contact(newModel));
		    }
		},

		removeContact: function (removedModel) {
			var removed = removedModel.attributes;

			if(removed.photo === "./img/placeholder.png") {
				delete removed.photo;
			}

			_.each(contacts, function (contact) {
				if (_.isEqual(contact, removed)) {
					contacts.splice(_.indexOf(contacts, contact), 1);
				}
			});
		},

		showForm: function(e) {
			e.preventDefault();
			this.$el.find("#addContact").slideToggle();
		}


	});

	var ContactsRouter = Backbone.Router.extend({
		routes: {
			"filter/:type": "urlFilter"
		},

		urlFilter: function (type) {
			directory1.filterType = type;
			directory1.trigger("change:filterType")
		}
	});

	var directory1 = new DirectoryView();
	//router instance
	var contactsRouter = new ContactsRouter();

	//start history service
	Backbone.history.start();
}(jQuery));
