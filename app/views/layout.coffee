@renderLayout = () ->
  $("html").append($tag("body").html(
      @layout
    )
  )

@layout = """
<div class="navbar navbar-fixed-top navbar-inverse" role="navigation">
<div class="container">
<div class="navbar-header">
<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
<span class="icon-bar"></span>
<span class="icon-bar"></span>
<span class="icon-bar"></span>
</button>
<a class="navbar-brand" href="/">Timecard</a>
</div>
<div class="collapse navbar-collapse">
<ul class="nav navbar-nav">
<li><a href="https://ruffnote.com/timecard/timecard" target="_blank">about</a></li>
</ul>
</div><!-- /.nav-collapse -->
</div><!-- /.container -->
</div><!-- /.navbar -->

<div class="container">
<div class="row row-offcanvas row-offcanvas-right">
<div class="col-xs-12 col-sm-3">   
<div class="well sidebar-nav">
<table id="work_logs" class="table">
</table>
</div>
<div class="well sidebar-nav add_buttons"> 
<ul class="nav nav-list" id="new_project">
<li><button class="btn add_project" type="button">add project</button></li>
<li><button class="btn show_ddt_issues" type="button">show DDT issues</button></li>
<li><button class="btn show_projects" type="button">show all projects</button></li>
<li><button class="btn do_export" type="button">export to file</button>
</li>
<li>
<input id="import_file" type="file" name="file" value="" />
<button class="btn do_import" type="button">import from file</button>
</li>
<!--
<li><button class="btn do_download" type="button">Download</button></li>
<li><button class="btn do_upload" type="button">Upload</button></li>
-->
</ul>
</div>
</div>
<div class="col-xs-12 col-sm-9 sidebar-offcanvas" id="wrapper" role="navigation"></div>
</div>
</div>
<footer>
<p>&copy; Timecard 2013</p>
</footer>
</div>
"""


