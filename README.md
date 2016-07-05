### Getting started

Clubbo requires that [Meteor](http://www.meteor.com) is installed.

You can run it locally like this:

```
clone https://github.com/BassT/clubbo.git
cd clubbo
meteor
```

Demo admins and users are already set up, see `server/fixtures.js`.

Unfortunately the tests are deprecated for now.

### Setting up your own team

Clubbo was developed for my lacrosse team. If you want to use it for your own team, customize `client/main.html` and the images in the `public` folder. Additionally, you might want to set up different fixtures (`server/fixtures.js`).

### Important packages

Routing: [Iron Router](http://iron-meteor.github.io/iron-router/)

Templating: [Blaze](https://guide.meteor.com/blaze.html)

Authorization: [Roles](https://github.com/alanning/meteor-roles)

Database schema: [Collection2](https://github.com/aldeed/meteor-collection2)
