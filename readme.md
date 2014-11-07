# Code @ NUS repositories

This meta-repository is the place for all the open source repositories on Code @
NUS.

# Adding your project

[Fork this repository](https://guides.github.com/activities/forking/), add in
your project(s) to `repo.json` and [send us a pull
request](https://help.github.com/articles/creating-a-pull-request)!

Each project you added should be a json object with at least one parameter -
`github_url`. There are a few optional paramters, listed below:

1. `release_url`: the link to the website you are hosting the project, a post where you describes about your project, or a link to download your project release. 
2. `image`: a small image to showcase your project
3. `tags`: an array of tags for your project. All tags are lower case, without spaces (replace spaces with dashes if you have multiple words, .e.g. `"sublime-text"`).

After adding your project, please run

```
npm test
```

to make sure that your modification is valid before sending out the pull request.

Please check that the syntax is correct before sending the pull request.
