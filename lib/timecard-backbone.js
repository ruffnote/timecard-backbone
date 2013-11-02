(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.JSRelModel = (function(_super) {
    __extends(JSRelModel, _super);

    function JSRelModel() {
      _ref = JSRelModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    JSRelModel.prototype.initialize = function() {
      return this.on('invalid', function(model, error) {
        return alert(error);
      });
    };

    JSRelModel.prototype.save = function(params) {
      var cond, p;

      if (params == null) {
        params = null;
      }
      cond = this.toJSON();
      if (this.set(cond, {
        validate: true
      })) {
        if (cond.id && this.find(cond.id)) {
          p = db.upd(this.table_name, cond);
        } else {
          p = db.ins(this.table_name, cond);
          this.set("id", p.id);
        }
        if (params && params.nosync) {
          return;
        }
        if (this.token) {
          console.log("token", this.token);
          return $.ajax({
            url: "" + AJAX_URL + "/" + this.table_name + ".json",
            type: "POST",
            beforeSend: function(xhr) {
              return xhr.setRequestHeader('X-CSRF-Token', this.token);
            },
            data: this.toJSON()
          });
        } else {
          return console.log("no token");
        }
      }
    };

    JSRelModel.prototype.find = function(id) {
      var data;

      data = db.one(this.table_name, {
        id: id
      });
      if (!data) {
        return;
      }
      return new this.constructor(data);
    };

    JSRelModel.prototype.find_all = function() {
      var res;

      res = this.collection(db.find(this.table_name, null, {
        order: {
          upd_at: "desc"
        }
      }));
      return res;
    };

    JSRelModel.prototype.where = function(cond) {
      return this.collection(db.find(this.table_name, cond, {
        order: {
          upd_at: "desc"
        }
      }));
    };

    JSRelModel.prototype.condition = function(cond) {
      return this.collection(db.find(this.table_name, null, cond));
    };

    return JSRelModel;

  })(Backbone.Model);

}).call(this);

(function() {
  var Issue, Issues, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Issue = (function(_super) {
    __extends(Issue, _super);

    function Issue() {
      _ref = Issue.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Issue.prototype.table_name = "issues";

    Issue.prototype.collection = function(params) {
      return new Issues(params);
    };

    Issue.prototype.validate = function(attrs) {
      if (_.isEmpty(attrs.title)) {
        return "issue.title must not be empty";
      }
    };

    Issue.prototype.is_ddt = function() {
      var wsat;

      wsat = this.get("will_start_at");
      return !(!wsat || wsat < now());
    };

    Issue.prototype.set_ddt = function() {
      this.set("will_start_at", now() + parseInt(12 * 3600 + 12 * 3600 * Math.random()));
      return this.save();
    };

    Issue.prototype.cancel_ddt = function() {
      this.set("will_start_at", null);
      return this.save();
    };

    Issue.prototype.is_closed = function() {
      var cat;

      cat = this.get("closed_at");
      if (cat > 0) {
        return true;
      } else {
        return false;
      }
    };

    Issue.prototype.set_closed = function() {
      this.set("closed_at", now());
      return this.save();
    };

    Issue.prototype.cancel_closed = function() {
      this.set("closed_at", 0);
      this.cancel_ddt();
      return this.save();
    };

    Issue.prototype.is_active = function() {
      if (!this.is_closed() && !this.is_ddt()) {
        return true;
      }
      return false;
    };

    Issue.prototype.title_with_url = function() {
      var issue, project;

      issue = this.toJSON();
      project = this.project().toJSON();
      if (issue.url) {
        return "<a href=\"" + issue.url + "\" target=\"_blank\">" + issue.title + "</a>";
      } else if (project.url) {
        return "<a href=\"" + project.url + "\" target=\"_blank\">" + issue.title + "</a>";
      } else {
        return issue.title;
      }
    };

    Issue.prototype.project = function() {
      return new Project().find(this.get("project_id"));
    };

    return Issue;

  })(JSRelModel);

  Issues = (function(_super) {
    __extends(Issues, _super);

    function Issues() {
      _ref1 = Issues.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Issues.prototype.model = Issue;

    return Issues;

  })(Backbone.Collection);

  this.Issue = Issue;

  this.Issues = Issues;

}).call(this);

(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Project = (function(_super) {
    __extends(Project, _super);

    function Project() {
      _ref = Project.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Project.prototype.table_name = "projects";

    Project.prototype.collection = function(params) {
      return new Projects(params);
    };

    Project.prototype.validate = function(attrs) {
      if (_.isEmpty(attrs.name)) {
        return "project name must not be empty";
      }
    };

    Project.prototype.is_active = function(cond) {
      var issue, issues, res, _i, _len;

      if (cond == null) {
        cond = {};
      }
      res = false;
      issues = new Issue().where({
        project_id: this.get('id')
      }).models;
      for (_i = 0, _len = issues.length; _i < _len; _i++) {
        issue = issues[_i];
        if (issue.is_active() && cond && cond.except_issue_id !== issue.get("id")) {
          res = true;
        }
      }
      return res;
    };

    Project.prototype.issues = function() {
      return new Issue().where({
        project_id: this.get("id")
      });
    };

    return Project;

  })(JSRelModel);

  this.Projects = (function(_super) {
    __extends(Projects, _super);

    function Projects() {
      _ref1 = Projects.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Projects.prototype.model = Project;

    return Projects;

  })(Backbone.Collection);

}).call(this);

(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WorkLog = (function(_super) {
    __extends(WorkLog, _super);

    function WorkLog() {
      _ref = WorkLog.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    WorkLog.prototype.table_name = "work_logs";

    WorkLog.prototype.collection = function(params) {
      return new WorkLogs(params);
    };

    WorkLog.prototype.last = function() {
      var res;

      res = this.condition({
        limit: 1,
        order: {
          id: "desc"
        }
      });
      if (typeof res.models[0] === "undefined") {
        return null;
      } else {
        return res.models[0];
      }
    };

    WorkLog.prototype.is_end = function() {
      if (this.get("end_at")) {
        return true;
      }
      return false;
    };

    WorkLog.prototype.start = function(issue_id) {
      var work_log;

      initCards();
      work_log = new WorkLog({
        issue_id: issue_id,
        started_at: now()
      });
      work_log.save();
      renderWork(issue_id);
      return left_work_logs.add(work_log);
    };

    WorkLog.prototype.stop = function() {
      initCards();
      this.set("end_at", now());
      this.save();
      return $("title").html("MNG");
    };

    return WorkLog;

  })(JSRelModel);

  this.WorkLogs = (function(_super) {
    __extends(WorkLogs, _super);

    function WorkLogs() {
      _ref1 = WorkLogs.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    WorkLogs.prototype.model = WorkLog;

    return WorkLogs;

  })(Backbone.Collection);

}).call(this);

(function() {
  this.AppController = (function() {
    function AppController() {}

    AppController.prototype.render = function() {
      var $issue_cards, addIssueView, addProjectView, issues, issuesView, last, project, projects, projectsView, workLogsView, _i, _len, _ref;

      projects = new Project().find_all();
      projectsView = new ProjectsView({
        collection: projects
      });
      $("#wrapper").html(projectsView.render().el);
      addProjectView = new AddProjectView({
        collection: projects
      });
      _ref = projects.toJSON();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        project = _ref[_i];
        issues = new Issue().where({
          project_id: project.id
        });
        issuesView = new IssuesView({
          collection: issues
        });
        $("#project_" + project.id + " div .issues").html(issuesView.render().el);
        addIssueView = new AddIssueView({
          collection: issues
        });
        $("#project_" + project.id + " div div.input-append").append(addIssueView.render().el);
      }
      workLogsView = new WorkLogsView({
        collection: left_work_logs
      });
      $("#work_logs").html(workLogsView.render().el);
      last = new WorkLog().last();
      if (last) {
        if (!last.is_end()) {
          $issue_cards = $(".issue_" + (last.get('issue_id')) + " .card");
          $issue_cards.html("Stop");
          $issue_cards.removeClass("btn-primary");
          return $issue_cards.addClass("btn-warning");
        }
      }
    };

    return AppController;

  })();

}).call(this);

(function() {
  var _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.IssueView = (function(_super) {
    __extends(IssueView, _super);

    function IssueView() {
      _ref = IssueView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    IssueView.prototype.initialize = function() {
      return this.model.on('change', this.updateIssue, this);
    };

    IssueView.prototype.tagName = 'div';

    IssueView.prototype.className = "issue col-lg-3";

    IssueView.prototype.events = {
      "click h2": "doOpenStart",
      "click div div .card": "doStart",
      "click div div .cls": "doClose",
      "click div div .ddt": "doDdt",
      "click div div .edit": "doEdit"
    };

    IssueView.prototype.updateIssue = function(issue) {
      var issue_id;

      issue_id = issue.get("id");
      $("#issue_" + issue_id + " h2").html(issue.title_with_url());
      if (!issue.is_active() && !issue.project().is_active({
        except_issue_id: issue_id
      })) {
        return $("#project_" + (issue.get('project_id'))).fadeOut(300);
      }
    };

    IssueView.prototype.doOpenStart = function(e) {
      var issue, project, url;

      e.preventDefault();
      issue = this.model.toJSON();
      project = new Project().find(issue.project_id).toJSON();
      url = issue.url;
      if (project.url && !url) {
        url = project.url;
      }
      if (url) {
        startWorking(issue.id);
        return window.open(url, "issue_" + issue.id);
      }
    };

    IssueView.prototype.doStart = function() {
      return startWorking(this.model.id);
    };

    IssueView.prototype.doClose = function(e) {
      var issue;

      e.preventDefault();
      issue = this.model;
      if (!issue.is_closed()) {
        issue.set_closed();
        stopWorking();
        return this.$el.fadeOut(200);
      } else {
        issue.cancel_closed();
        this.$el.fadeIn(300);
        this.$el.css("background", "#fff");
        this.$el.find(".btn-group .cls").addClass("btn-danger");
        return this.$el.find(".btn-group .cls").html("Close");
      }
    };

    IssueView.prototype.doDdt = function(e) {
      var issue;

      e.preventDefault();
      issue = this.model;
      if (!issue.is_ddt()) {
        issue.set_ddt();
        stopWorking();
        return this.$el.fadeOut(200);
      } else {
        issue.cancel_ddt();
        this.$el.css("background", "#fff");
        this.$el.find(".btn-group .ddt").addClass("btn-warning");
        return this.$el.find(".btn-group .ddt").html("DDT");
      }
    };

    IssueView.prototype.doEdit = function(e) {
      var i, issue;

      e.preventDefault();
      issue = this.model;
      i = issue.toJSON();
      issue.set({
        title: prompt('issue title', i.title),
        url: prompt('issue url', i.url)
      });
      return issue.save();
    };

    IssueView.prototype.render = function() {
      var $cls, $ddt, $group, $time, $title, $tools, issue;

      issue = this.model.toJSON();
      $title = $tag("h2").html(this.model.title_with_url());
      $time = $tag("span", {
        "class": "time"
      });
      $title.append($time);
      this.$el.append($title);
      $group = $tag("div", {
        "class": "btn-group issue_" + issue.id
      });
      $group.append($tag("a", {
        "class": "card btn btn-primary",
        href: "#"
      }).html("S"));
      $group.append($tag("a", {
        "class": "ddt btn btn-warning",
        href: "#"
      }).html("D"));
      $group.append($tag("a", {
        "class": "cls btn btn-danger",
        href: "#"
      }).html("C"));
      $group.append($tag("a", {
        "class": "edit btn btn-default",
        href: "#"
      }).html("E"));
      $tools = $tag("div", {
        "class": "btn-toolbar"
      });
      $tools.html($group);
      this.$el.append($tools);
      this.$el.append($tag("div", {
        "class": "body"
      }).html(issue.body));
      if (this.model.is_active()) {
        $("#project_" + issue.project_id).show();
      } else {
        this.$el.hide();
        this.$el.css("background", "#ccc");
        if (this.model.is_ddt()) {
          $ddt = this.$el.find(".btn-group .ddt");
          $ddt.removeClass("btn-warning");
          $ddt.html("DT");
        }
        if (this.model.is_closed()) {
          $cls = this.$el.find(".btn-group .cls");
          $cls.removeClass("btn-danger");
          $cls.html("Reopen");
        }
      }
      if (!this.model.is_closed()) {
        this.$el.addClass("open");
      }
      return this;
    };

    return IssueView;

  })(Backbone.View);

  this.IssuesView = (function(_super) {
    __extends(IssuesView, _super);

    function IssuesView() {
      _ref1 = IssuesView.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    IssuesView.prototype.initialize = function() {
      return this.collection.on('add', this.addIssue, this);
    };

    IssuesView.prototype.addIssue = function(issue) {
      var issueView, project_id;

      issueView = new IssueView({
        model: issue,
        id: "issue_" + issue.id
      });
      project_id = issue.get('project_id');
      $("#project_" + project_id + " div .issues").append(issueView.render().el);
      return $("#project_" + (issue.get('project_id'))).show();
    };

    IssuesView.prototype.render = function() {
      this.collection.each(function(issue) {
        var issueView;

        issueView = new IssueView({
          model: issue,
          id: "issue_" + issue.id
        });
        return this.$el.append(issueView.render().el);
      }, this);
      return this;
    };

    return IssuesView;

  })(Backbone.View);

  this.AddIssueView = (function(_super) {
    __extends(AddIssueView, _super);

    function AddIssueView() {
      _ref2 = AddIssueView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    AddIssueView.prototype.tagName = "form";

    AddIssueView.prototype.className = "add_issue";

    AddIssueView.prototype.events = {
      'submit': 'submit'
    };

    AddIssueView.prototype.submit = function(e) {
      var $title, issue, project_id, title;

      e.preventDefault();
      $title = $(e.target).find(".input");
      title = $title.val();
      project_id = parseInt($(e.target).parent().parent().parent().attr("id").replace("project_", ""));
      issue = new Issue({
        project_id: project_id,
        title: title
      });
      issue.save();
      this.collection.add(issue);
      return $title.val("");
    };

    AddIssueView.prototype.render = function() {
      this.$el.append($tag("input", {
        type: "text",
        "class": "input"
      }));
      this.$el.append($tag("input", {
        type: "submit",
        value: "add issue",
        "class": "btn"
      }));
      return this;
    };

    return AddIssueView;

  })(Backbone.View);

}).call(this);

(function() {
  var _ref, _ref1, _ref2,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $('#id').focus();

  $('.add_project').bind('ajax:complete', function(request) {
    return location.reload();
  });

  this.ProjectView = (function(_super) {
    __extends(ProjectView, _super);

    function ProjectView() {
      _ref = ProjectView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ProjectView.prototype.tagName = 'div';

    ProjectView.prototype.className = 'project';

    ProjectView.prototype.initialize = function() {
      return this.model.on('change', this.render, this);
    };

    ProjectView.prototype.events = {
      "click div a.edit": "clickEdit",
      "click div a.ddt": "clickDdt"
    };

    ProjectView.prototype.clickEdit = function() {
      var p, project;

      project = new Project().find(this.model.id);
      p = project.toJSON();
      project.set({
        name: prompt('project name', p.name),
        url: prompt('project url', p.url)
      });
      project.save();
      return $("#project_" + p.id + " div h1").html(p.name);
    };

    ProjectView.prototype.clickDdt = function() {
      var issue, _i, _len, _ref1;

      _ref1 = this.model.issues().models;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        issue = _ref1[_i];
        if (!issue.is_ddt()) {
          issue.set_ddt();
        }
      }
      return $("#project_" + (this.model.get('id'))).fadeOut(300);
    };

    ProjectView.prototype.render = function() {
      var $buttons, $project;

      $project = $tag("div");
      $project.html($tag("h1").html(this.model.toJSON().name));
      $project.append($tag("div", {
        "class": "issues"
      }));
      $project.append($tag("div", {
        "class": "input-append"
      }));
      $buttons = $tag("div", {
        "class": "btn-group"
      });
      $buttons.append($tag("a", {
        "class": "btn btn-warning ddt",
        href: "#"
      }).html("DDT"));
      $buttons.append($tag("a", {
        "class": "btn btn-default edit",
        href: "#"
      }).html("Edit"));
      $project.append($buttons);
      this.$el.html($project);
      return this;
    };

    return ProjectView;

  })(Backbone.View);

  this.ProjectsView = (function(_super) {
    __extends(ProjectsView, _super);

    function ProjectsView() {
      _ref1 = ProjectsView.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    ProjectsView.prototype.id = "issues";

    ProjectsView.prototype.tagName = 'div';

    ProjectsView.prototype.initialize = function() {
      return this.collection.on('add', this.addProject, this);
    };

    ProjectsView.prototype.addProject = function(project) {
      var projectView;

      projectView = new ProjectView({
        model: project,
        id: "project_" + project.id
      });
      return this.$el.prepend(projectView.render().el);
    };

    ProjectsView.prototype.className = "row-fluid";

    ProjectsView.prototype.render = function() {
      this.collection.each(function(project) {
        var projectView;

        projectView = new ProjectView({
          model: project,
          id: "project_" + project.id
        });
        return this.$el.append(projectView.render().el);
      }, this);
      return this;
    };

    return ProjectsView;

  })(Backbone.View);

  this.AddProjectView = (function(_super) {
    __extends(AddProjectView, _super);

    function AddProjectView() {
      _ref2 = AddProjectView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    AddProjectView.prototype.el = ".add_project";

    AddProjectView.prototype.events = {
      "click": "clicked"
    };

    AddProjectView.prototype.clicked = function(e) {
      var addIssueView, issue, issues, issuesView, name, project, project_id, projects, title;

      e.preventDefault();
      name = prompt('please input the project name', '');
      title = prompt('please input the issue title', 'add issues');
      projects = new Project().where({
        name: name
      });
      if (projects.models[0]) {
        project = projects.models[0];
      } else {
        project = new Project();
      }
      issue = new Issue();
      if (project.set({
        name: name
      }, {
        validate: true
      })) {
        project.save();
        this.collection.add(project);
        project_id = project.get("id");
        if (issue.set({
          title: title,
          project_id: project_id
        }, {
          validate: true
        })) {
          issue.save();
          issues = new Issue().where({
            project_id: project_id
          });
          issuesView = new IssuesView({
            collection: issues
          });
          $("#project_" + project.id + " div .issues").html(issuesView.render().el);
          $("#project_" + project_id).show();
          addIssueView = new AddIssueView({
            collection: issues
          });
          return $("#project_" + project_id + " div div.input-append").append(addIssueView.render().el);
        }
      }
    };

    return AddProjectView;

  })(Backbone.View);

}).call(this);

(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.WorkLogView = (function(_super) {
    __extends(WorkLogView, _super);

    function WorkLogView() {
      _ref = WorkLogView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    WorkLogView.prototype.tagName = "tr";

    WorkLogView.prototype.initialize = function() {
      return this.model.on('change', this.updateWorkLog, this);
    };

    WorkLogView.prototype.events = {
      "click td div a.card.btn-primary": "startWorking",
      "click td div a.card.btn-warning": "stopWorking"
    };

    WorkLogView.prototype.startWorking = function(e) {
      e.preventDefault();
      return startWorking(this.model.toJSON().issue_id);
    };

    WorkLogView.prototype.startWorking = function() {
      return startWorking(this.model.get('issue_id'));
    };

    WorkLogView.prototype.stopWorking = function() {
      return stopWorking();
    };

    WorkLogView.prototype.render = function() {
      var $td, issue, work_log;

      work_log = this.model.toJSON();
      issue = new Issue().find(work_log.issue_id).toJSON();
      this.$el.append($td = $tag("td", {
        "class": "word_break"
      }).html(wbr(issue.title, 9)));
      this.$el.append($td = $tag("td").html(dispDate(work_log)));
      this.$el.append($tag("td").html($tag("span", {
        "class": "time"
      }).html(dispTime(work_log))));
      this.$el.append($tag("td").html($tag("div", {
        "class": "work_log_" + work_log.id + " issue_" + issue.id,
        style: "padding:10px;"
      }).html($tag("a", {
        href: "#",
        "class": "card btn btn-primary",
        "data-issue-id": issue.id
      }).html("S"))));
      return this;
    };

    return WorkLogView;

  })(Backbone.View);

  this.WorkLogsView = (function(_super) {
    __extends(WorkLogsView, _super);

    function WorkLogsView() {
      _ref1 = WorkLogsView.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    WorkLogsView.prototype.initialize = function() {
      return left_work_logs.on('add', this.addWorkLog, this);
    };

    WorkLogsView.prototype.addWorkLog = function(work_log) {
      var workLogView;

      workLogView = new WorkLogView({
        model: work_log,
        id: "work_log_" + work_log.id
      });
      $("#work_logs div:first").prepend(workLogView.render().el);
      return renderWork(work_log.get('issue_id'));
    };

    WorkLogsView.prototype.render = function() {
      this.collection.each(function(work_log) {
        var workLogView;

        workLogView = new WorkLogView({
          model: work_log,
          id: "work_log_" + work_log.id,
          className: "work_log_" + work_log.id
        });
        return this.$el.append(workLogView.render().el);
      }, this);
      return this;
    };

    return WorkLogsView;

  })(Backbone.View);

}).call(this);

(function() {
  var addFigure, checkImport, db, debug, doImport, findIssueByWorkLog, findProjectByIssue, findWillUploads, forUploadIssue, forUploadWorkLog, hl, init, innerLink, last_fetch, loopFetch, loopRenderWorkLogs, prepareDoDownload, prepareDoExport, prepareDoImport, prepareDoUpload, prepareShowDdtIssues, prepareShowProjects, pushIfHasIssue, renderCalendar, renderCalendars, renderWorkingLog, setInfo, turnback, uicon, zero, zp;

  init = function() {
    prepareShowProjects();
    prepareShowDdtIssues();
    prepareDoExport();
    prepareDoImport();
    prepareDoDownload();
    prepareDoUpload();
    this.left_work_logs = new WorkLog().condition({
      order: {
        started_at: "desc"
      },
      limit: 20
    });
    new AppController().render();
    $(".calendar").hide();
    return loopRenderWorkLogs();
  };

  this.renderWork = function(issue_id) {
    var $issue_cards;

    $issue_cards = $(".issue_" + issue_id + " .card");
    $issue_cards.html("Stop");
    $issue_cards.removeClass("btn-primary");
    return $issue_cards.addClass("btn-warning");
  };

  prepareShowProjects = function() {
    return $(".show_projects").click(function() {
      $(".project").fadeIn(100);
      return $(".ddt").fadeIn(100);
    });
  };

  prepareShowDdtIssues = function() {
    return $(".show_ddt_issues").click(function() {
      $(".project").fadeIn(100);
      $(".issue").hide();
      return $(".open").fadeIn(100);
    });
  };

  prepareDoExport = function() {
    return hl.click(".do_export", function(e, target) {
      var a, blob, caseTitle, d, result, title, url;

      result = {
        projects: db.find("projects"),
        issues: db.find("issues"),
        work_logs: db.find("work_logs"),
        servers: db.find("servers"),
        infos: db.find("infos")
      };
      blob = new Blob([JSON.stringify(result)]);
      url = window.URL.createObjectURL(blob);
      d = new Date();
      caseTitle = "Timecard";
      title = caseTitle + "_" + d.getFullYear() + zp(d.getMonth() + 1) + d.getDate() + ".json";
      a = $('<a id="download"></a>').text("download").attr("href", url).attr("target", '_blank').attr("download", title).hide();
      $(".do_export").after(a);
      $("#download")[0].click();
      return false;
    });
  };

  prepareDoDownload = function() {
    return hl.click(".do_download", function(e, target) {
      $.get("/projects.json", function(projects) {
        var p, project, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = projects.length; _i < _len; _i++) {
          project = projects[_i];
          p = new Project({
            id: project.id,
            name: project.name,
            url: project.url
          });
          console.log(p);
          _results.push(p.save({
            nosync: true
          }));
        }
        return _results;
      });
      $.get("/issues.json", function(issues) {
        var i, issue, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = issues.length; _i < _len; _i++) {
          issue = issues[_i];
          i = new Issue({
            id: issue.id,
            title: issue.title,
            project_id: issue.project_id,
            url: issue.url,
            closed_at: issue.closed_at,
            will_start_at: issue.will_start_at
          });
          _results.push(i.save({
            nosync: true
          }));
        }
        return _results;
      });
      return $.get("/work_logs.json", function(work_logs) {
        var w, work_log, _i, _len, _results;

        _results = [];
        for (_i = 0, _len = work_logs.length; _i < _len; _i++) {
          work_log = work_logs[_i];
          w = new WorkLog({
            id: work_log.id,
            issue_id: work_log.issue_id,
            started_at: work_log.started_at,
            end_at: work_log.end_at
          });
          w.save({
            nosync: true
          });
          _results.push(location.reload());
        }
        return _results;
      });
    });
  };

  prepareDoUpload = function() {
    return hl.click(".do_upload", function(e, target) {
      var data, issue, project, work_log, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;

      data = {
        projects: db.find("projects"),
        issues: db.find("issues"),
        work_logs: db.find("work_logs")
      };
      _ref = data.projects;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        project = _ref[_i];
        $.post("/projects", project);
      }
      _ref1 = data.issues;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        issue = _ref1[_j];
        $.post("/issues.json", issue);
      }
      _ref2 = data.work_logs;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        work_log = _ref2[_k];
        $.post("/work_logs.json", work_log);
      }
      return false;
    });
  };

  prepareDoImport = function() {
    hl.click(".do_import", function(e, target) {
      var datafile;

      datafile = $("#import_file").get(0).files[0];
      if (datafile) {
        return checkImport(datafile);
      } else {
        return $("#import_file").click();
      }
    });
    return $("#import_file").change(function() {
      var datafile;

      datafile = $("#import_file").get(0).files[0];
      if (datafile) {
        return checkImport(datafile);
      } else {
        return alert("invalid data.");
      }
    });
  };

  checkImport = function(datafile) {
    var reader;

    reader = new FileReader();
    reader.onload = function(evt) {
      var json, result;

      json = JSON.parse(evt.target.result);
      result = doImport(json);
      if (result) {
        alert("import is done.");
        return location.reload();
      } else {
        return alert("import is failed.");
      }
    };
    reader.readAsText(datafile, 'utf-8');
    return false;
  };

  doImport = function(json) {
    var data, item, table_name, _i, _len;

    for (table_name in json) {
      data = json[table_name];
      db.del(table_name);
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
        if (table_name === "issues") {
          item.ddt_interval = 43200;
        }
        db.ins(table_name, item);
      }
    }
    return true;
  };

  innerLink = function() {
    var project, projects, res, _i, _len;

    res = "<div class=\"innerlink\"> | ";
    projects = Project.find_all;
    for (_i = 0, _len = projects.length; _i < _len; _i++) {
      project = projects[_i];
      res += "<span class=\"project_" + project.id + "\"><a href=\"#project_" + project.id + "\">" + project.name + "</a> | </span>";
    }
    res += "</div>";
    return res;
  };

  this.initCards = function() {
    var $all_cards;

    $all_cards = $(".card");
    $all_cards.html("S");
    $all_cards.removeClass("btn-warning");
    return $all_cards.addClass("btn-primary");
  };

  this.stopWorking = function() {
    new WorkLog().last().stop();
    return initCards();
  };

  this.startWorking = function(issue_id) {
    var last;

    if (issue_id == null) {
      issue_id = null;
    }
    initCards();
    last = new WorkLog().last();
    if (last) {
      if (last.is_end() && issue_id) {
        return last.start(issue_id);
      } else {
        if (issue_id && last.get("issue_id") !== issue_id) {
          last.stop();
          return last.start(issue_id);
        } else {
          return stopWorking();
        }
      }
    } else {
      return new WorkLog().start(issue_id);
    }
  };

  this.wbr = function(str, num) {
    if (str == null) {
      str = "noname";
    }
    return str.replace(RegExp("(\\w{" + num + "})(\\w)", "g"), function(all, text, char) {
      return text + "<wbr>" + char;
    });
  };

  renderCalendars = function() {
    var mon, now, year;

    now = new Date();
    year = now.getYear() + 1900;
    mon = now.getMonth() + 1;
    renderCalendar("this_month", now);
    now = new Date(year, mon, 1);
    return renderCalendar("next_month", now);
  };

  renderCalendar = function(key, now) {
    var $day, d, day, i, mon, start, w, wday, year, _i;

    year = now.getYear() + 1900;
    mon = now.getMonth() + 1;
    day = now.getDate();
    wday = now.getDay();
    start = wday - day % 7 - 1;
    w = 1;
    $("." + key + " h2").html("" + year + "-" + (zp(mon)));
    for (i = _i = 1; _i <= 31; i = ++_i) {
      d = (i + start) % 7 + 1;
      $day = $("." + key + " table .w" + w + " .d" + d);
      $day.html(i).addClass("day" + i);
      if (i === day && key === "this_month") {
        $day.css("background", "#fc0");
      }
      $day.addClass("md_" + mon + "_" + i);
      if (d === 7) {
        w += 1;
      }
    }
    return renderWorkLogs();
  };

  renderWorkingLog = function() {
    var issue, last, time, wl;

    last = new WorkLog().last();
    if (last) {
      if (!last.is_end()) {
        wl = last.toJSON();
        time = dispTime(wl);
        $(".work_log_" + wl.id + " .time").html(time);
        $("#issue_" + wl.issue_id + " h2 .time").html("(" + time + ")");
        $("#issue_" + wl.issue_id + " div div .card").html("Stop");
        issue = db.one("issues", {
          id: wl.issue_id
        });
        $(".hero-unit h1").html(issue.title);
        $(".hero-unit p").html(issue.body);
      }
      return $("title").html(time);
    }
  };

  loopRenderWorkLogs = function() {
    renderWorkingLog();
    return setTimeout(function() {
      return loopRenderWorkLogs();
    }, 1000);
  };

  loopFetch = function() {
    var server, _i, _len, _ref;

    _ref = db.find("servers");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      server = _ref[_i];
      fetch(server);
    }
    return setTimeout(function() {
      return loopFetch();
    }, 1000 * 10);
  };

  last_fetch = function(sec) {
    var info;

    if (sec == null) {
      sec = null;
    }
    if (sec) {
      setInfo("last_fetch", sec);
    }
    info = db.one("infos", {
      key: "last_fetch"
    });
    if (info) {
      return info.val;
    } else {
      return 0;
    }
  };

  this.dispTime = function(work_log) {
    var hour, min, msec, res, sec;

    msec = 0;
    if (work_log.end_at) {
      sec = work_log.end_at - work_log.started_at;
    } else {
      sec = now() - work_log.started_at;
    }
    if (sec > 3600) {
      hour = parseInt(sec / 3600);
      min = parseInt((sec - hour * 3600) / 60);
      res = "" + (zero(hour)) + ":" + (zero(min)) + ":" + (zero(sec - hour * 3600 - min * 60));
    } else if (sec > 60) {
      min = parseInt(sec / 60);
      res = "" + (zero(min)) + ":" + (zero(sec - min * 60));
    } else {
      res = "" + sec + "秒";
    }
    return res;
  };

  this.dispDate = function(work_log) {
    var time;

    time = new Date(work_log.started_at * 1000);
    return "" + (time.getMonth() + 1) + "/" + (time.getDate());
  };

  setInfo = function(key, val) {
    var info;

    info = db.one("infos", {
      key: key
    });
    if (info) {
      info.val = val;
      info = db.upd("infos", info);
    } else {
      info = db.ins("infos", {
        key: key,
        val: val
      });
    }
    return info;
  };

  db = JSRel.use("crowdsourcing", {
    schema: window.schema,
    autosave: true
  });

  hl = {
    click: function(dom, callback) {
      return $(dom).click(function(e) {
        return callback(e);
      });
    }
  };

  zero = function(int) {
    if (int < 10) {
      return "0" + int;
    } else {
      return int;
    }
  };

  this.now = function() {
    return parseInt((new Date().getTime()) / 1000);
  };

  uicon = "<i class=\"icon-circle-arrow-up\"></i>";

  turnback = function($e) {
    if ($e.css("display") === "none") {
      return $e.fadeIn(400);
    } else {
      return $e.fadeOut(400);
    }
  };

  findWillUploads = function(table_name) {
    return db.find(table_name, {
      server_id: null
    });
  };

  pushIfHasIssue = function(project, projects) {
    if (db.one("issues", {
      project_id: project.id
    })) {
      project.local_id = project.id;
      delete project.id;
      projects.push(project);
    }
    return projects;
  };

  findProjectByIssue = function(issue) {
    return db.one("projects", {
      id: issue.project_id
    });
  };

  findIssueByWorkLog = function(work_log) {
    return db.one("issues", {
      id: work_log.issue_id
    });
  };

  forUploadIssue = function(issue) {
    var project;

    project = findProjectByIssue(issue);
    if (project.server_id) {
      issue.project_server_id = project.server_id;
    }
    issue.local_id = issue.id;
    delete issue.id;
    return issue;
  };

  forUploadWorkLog = function(work_log) {
    var issue;

    issue = findIssueByWorkLog(work_log);
    if (issue.server_id) {
      work_log.issue_server_id = issue.server_id;
    }
    work_log.local_id = work_log.id;
    delete work_log.id;
    return work_log;
  };

  debug = function(title, data) {
    if (data == null) {
      data = null;
    }
    console.log(title);
    if (data) {
      return console.log(data);
    }
  };

  window.db = db;

  zp = function(n) {
    if (n >= 10) {
      return n;
    } else {
      return '0' + n;
    }
  };

  addFigure = function(str) {
    var num;

    num = new String(str).replace(/,/g, "");
    while (num !== num.replace(/^(-?\d+)(\d{3})/, "$1,$2")) {
      num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2");
    }
    return num;
  };

  this.$tag = function(el, attrs) {
    var attr, i;

    if (attrs == null) {
      attrs = false;
    }
    attr = "";
    if (attrs) {
      for (i in attrs) {
        attr += " " + i + "=\"" + attrs[i] + "\"";
      }
    }
    return $("<" + el + attr + "></" + el + ">");
  };

  $(function() {
    return init();
  });

}).call(this);
