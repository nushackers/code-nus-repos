var repos = require('./repos'),
    url = require('url'),
    GitHubApi = require('github'),
    Q = require('q'),
    _ = require('underscore'),
    fs = require('fs'),
    config = require('./config');

var github = new GitHubApi({
    version: "3.0.0",
    timeout: 5000
});

github.authenticate(config.github_auth);

function getMeta(githubRepo, repoInfo) {
    var d = Q.defer();
    github.repos.get(githubRepo, function(err, result) {
        if (err) {
            d.reject(err);
        } else {
            d.resolve({
                title: result.name,
                description: result.description,
                stars: result.stargazers_count,
                homepage: result.homepage,
                author: {
                    name: result.owner.login,
                    href: result.owner.html_url
                },
                repository: {
                    href: result.html_url
                }
            });
        }
    });
    return d.promise;
}

function getRelease(githubRepo, repoInfo) {
    var d = Q.defer();
    if (repoInfo.release_url) {
        d.resolve({
            release: {
                href: repoInfo.release_url
            }
        });
    } else {
        github.releases.listReleases(githubRepo, function(err, releases) {
            if (err) {
                d.reject(err);
            } else {
                var release = releases && releases[0];
                if (release) {
                    d.resolve({
                        release: {
                            href: release.html_url
                        }
                    });
                } else {
                    d.resolve();
                }
            }
        });
    }
    return d.promise;
}

function getLastCommitDate(githubRepo, repoInfo) {
    var d = Q.defer();
    github.repos.getCommits(githubRepo, function(err, commits) {
        if (err) {
            d.reject(err);
        } else {
            var commit = commits && commits[0];
            if (commit) {
                d.resolve({
                    last_commit_date: commit.commit.committer.date
                });
            } else {
                d.resolve();
            }
        }
    });
    return d.promise;
}

var tag_stats = {};

Q.all(repos.map(function(repo) {
    var d = Q.defer();

    var githubUrl = repo.github_url;
    var pathname = url.parse(githubUrl).pathname;
    var components = pathname.split('/');
    if (components.length > 3) {
        throw "invalid url " + githubUrl;
    }
    var githubRepo = {
        user: components[1],
        owner: components[1],
        repo: components[2]
    };
    var tags = {};
    repo.tags.forEach(function(t) {
        tags[t] = 1;
        if (tag_stats[t]) {
            tag_stats[t]++;
        } else {
            tag_stats[t] = 1;
        }
    });

    Q.spread([
        getMeta(githubRepo, repo),
        getRelease(githubRepo, repo),
        getLastCommitDate(githubRepo, repo)
    ], function(meta, release, lastCommitDate) {
        var result = _.extend(_.extend(meta, release), lastCommitDate);
        result.tags = tags;
        d.resolve(result);
    });

    return d.promise;
})).then(function(result) {
    var projects = [];
    [].push.apply(projects, result);

    fs.writeFileSync("./data_ori.json", JSON.stringify({
        projects: projects,
        tag_stats: tag_stats
    }, null, '    '));
    fs.writeFileSync("./data.json", JSON.stringify({
        projects: projects,
        tag_stats: tag_stats
    }));
});