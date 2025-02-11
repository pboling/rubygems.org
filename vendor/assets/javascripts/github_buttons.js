/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this work except in compliance with the License.
 * You may obtain a copy of the License in the LICENSE file, or at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Source: https://github.com/mdo/github-buttons/blob/7c1da76484288ce76fa061362fc1c1f0db1f6553/src/js.js
 * Modification: Changed params to read attributes from data-params
 *               Execute only when .github-btn exists
 *               Remove title update (mdo/github-buttons@cbf5395b)
 */

if ($(".github-btn").length) {
  (function() {
    'use strict';

  // Read a page's GET URL variables and return them as an associative array.
  // Source: https://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
  function getUrlParameters() {
    var vars = [];
    var hash;
    var hashes = $('.github-btn').attr('data-params').split('&');

    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }

    return vars;
  }

  // Add commas to numbers
  function addCommas(n) {
    return String(n).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }

  function jsonp(path) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        var res = { data: { stargazers_count: xhr.response.stargazers_count } };
        callback(res);
      } else {
        console.log("Request to github failed with status:", status)
      }
    };
    xhr.send();
  }

  var parameters = getUrlParameters();

  // Parameters
  var user = parameters.user;
  var repo = parameters.repo;
  var type = parameters.type;
  var count = parameters.count;
  var size = parameters.size;
  var v = parameters.v;

  // Elements
  var button = document.querySelector('.gh-btn');
  var mainButton = document.querySelector('.github-btn');
  var text = document.querySelector('.gh-text');
  var counter = document.querySelector('.gh-count');

  // Constants
  var LABEL_SUFFIX = ' on GitHub';
  var GITHUB_URL = 'https://github.com/';
  var API_URL = 'https://api.github.com/';
  var REPO_URL = GITHUB_URL + user + '/' + repo;
  var USER_REPO = user + '/' + repo;

  window.callback = function(obj) {
    if (obj.data.message === 'Not Found') {
      return;
    }

    switch (type) {
      case 'watch':
        if (v === '2') {
          counter.textContent = obj.data.subscribers_count && addCommas(obj.data.subscribers_count);
          counter.setAttribute('aria-label', counter.textContent + ' watchers' + LABEL_SUFFIX);
        } else {
          counter.textContent = obj.data.stargazers_count && addCommas(obj.data.stargazers_count);
          counter.setAttribute('aria-label', counter.textContent + ' stargazers' + LABEL_SUFFIX);
        }

        break;
      case 'star':
        counter.textContent = obj.data.stargazers_count && addCommas(obj.data.stargazers_count);
        counter.setAttribute('aria-label', counter.textContent + ' stargazers' + LABEL_SUFFIX);
        break;
      case 'fork':
        counter.textContent = obj.data.network_count && addCommas(obj.data.network_count);
        counter.setAttribute('aria-label', counter.textContent + ' forks' + LABEL_SUFFIX);
        break;
      case 'follow':
        counter.textContent = obj.data.followers && addCommas(obj.data.followers);
        counter.setAttribute('aria-label', counter.textContent + ' followers' + LABEL_SUFFIX);
        break;
    }

    // Show the count if asked and if it's not empty
    if (count === 'true' && counter.textContent !== '') {
      counter.style.display = 'block';
      counter.removeAttribute('aria-hidden');
    }
  };

  // Set href to be URL for repo
  button.href = REPO_URL;

  var title;

  // Add the class, change the text label, set count link href
  switch (type) {
    case 'watch':
      if (v === '2') {
        mainButton.className += ' github-watchers';
        text.textContent = 'Watch';
        counter.href = REPO_URL + '/watchers';
      } else {
        mainButton.className += ' github-stargazers';
        text.textContent = 'Star';
        counter.href = REPO_URL + '/stargazers';
      }

      title = text.textContent + ' ' + USER_REPO;
      break;
    case 'star':
      mainButton.className += ' github-stargazers';
      text.textContent = 'Star';
      counter.href = REPO_URL + '/stargazers';
      title = text.textContent + ' ' + USER_REPO;
      break;
    case 'fork':
      mainButton.className += ' github-forks';
      text.textContent = 'Fork';
      button.href = REPO_URL + '/fork';
      counter.href = REPO_URL + '/network';
      title = text.textContent + ' ' + USER_REPO;
      break;
    case 'follow':
      mainButton.className += ' github-me';
      text.textContent = 'Follow @' + user;
      button.href = GITHUB_URL + user;
      counter.href = GITHUB_URL + user + '?tab=followers';
      title = text.textContent;
      break;
    case 'sponsor':
      mainButton.className += ' github-me';
      text.textContent = 'Sponsor @' + user;
      button.href = GITHUB_URL + 'sponsors/' + user;
      title = text.textContent;
      break;
  }

  button.setAttribute('aria-label', title + LABEL_SUFFIX);

  // Change the size if requested
  if (size === 'large') {
    mainButton.className += ' github-btn-large';
  }

  // If count is not requested or type is sponsor,
  // there's no need to make an API call
  if (count !== 'true' || type === 'sponsor') {
    return;
  }

  if (type === 'follow') {
    jsonp(API_URL + 'users/' + user);
  } else {
    jsonp(API_URL + 'repos/' + user + '/' + repo);
  }
})();
}
