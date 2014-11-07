var repos = require('./repos.json');

var assert = require('assert');

var all_urls = {};

repos.forEach(function(repo) {
    assert(repo.github_url, "github_url is required " + JSON.stringify(repo));
    assert(!(repo.github_url in all_urls), "github_url is repeated: " + repo.github_url);
    all_urls[repo.github_url] = true;

    assert(repo.tags && repo.tags.length, "tags are required ", JSON.stringify(repo));
    repo.tags.forEach(function(tag) {
        assert(/^[a-z-]+$/.test(tag), "tag is not valid: " + tag);
    });
});