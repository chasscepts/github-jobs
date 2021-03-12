(function iife() {
  function main() {
    setupLoading();
  }

  function setupLoading() {
    //https://jobs.github.com/positions.json?description=python&full_time=true&location=sf

    let store = [], pointer = 0, page = 0;
    const baseUrl = 'https://arcane-temple-01740.herokuapp.com/https://jobs.github.com/positions.json';
    const UNIT = 12;
    const articlesWrap = document.querySelector('#articles-wrap');
    const loadingWrap = document.querySelector('#loading-wrap');
    const searchForm = document.querySelector('#search-form');

    let description = '', fulltime = false, location = '';

    const load = () => {
      if(pointer + UNIT < store.length){
        addArticlesToDom();
        return;
      }

      loadingWrap.classList.add('loading');
      fetchNextPag()
        .then(res => {
          addArticlesToDom();
          loadingWrap.classList.remove('loading');
        })
        .catch(err => {
          showError(err);
          loadingWrap.classList.remove('loading');
        });
    }

    const addArticlesToDom = () => {
      const max = Math.min(pointer + UNIT, store.length);
      while(pointer < max) {
        articlesWrap.append(createJobListArticles(store[pointer++]));
      }
    }

    const fetchNextPage = () => {
      return new Promise((resolve, reject) => {
        const url = baseUrl + queryParams();
        //const url = 'https://github-jobs-proxy.appspot.com/positions?description=javascript&location=san+francisco';
        const xhr = new XMLHttpRequest();
        xhr.open('get', url);
        xhr.onload = () => {
          if(xhr.status === 200) {
            try {
              console.log(xhr.response);
              const arr = JSON.parse(xhr.response);
              store = [...store, ...arr];
              resolve();
            }
            catch(err) {
              reject(err);
            }
          }
          else {
            reject(xhr.response);
          }
        }

        xhr.send();
      });
    }

    const fetchNextPag = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          store = [...store, ...testJobs];
          resolve();
        }, 2000);
      });
    }

    const queryParams = () => {
      const arr = [];
      if(page) {
        arr.push(`page=${page}`);
      }
      if(description) {
        arr.push(`description=${description}`);
      }
      if(fulltime) {
        arr.push('full_time=true');
      }
      if(arr.length <= 0) return '';
      return `?${arr.join('&')}`;
    }

    load();
    searchForm.addEventListener('submit', evt => {
      evt.preventDefault();
      description = searchForm.search_company.value;
      location = searchForm.search_location.value;
      fulltime = searchForm.search_fulltime.checked;
      page = 0;
      store = [];
      articlesWrap.innerHTML = '';
      load();
      return false;
    });
  }

  function createJobListArticles(job) {
    /*<article class="job-list-card position-relative">
      <img class="company-logo" src="assets/images/sample.png" alt="logo">
      <div class="card clickable">
        <div class="d-flex flex-column inner">
          <h3 class="text-black order-2">Senior Software Engineer</h3>
          <p class="type order-1">
            <time datetime="2021-03-11">5h ago</time>
            <span>Full Time</span>
          </p>
          <p class="order-3">So Digital Inc.</p>
          <p class="text-light order-4 location">Remote, Seoul, Tokyo, Mountain View, San Francisco</p>
        </div>
      </div>
    </article>
    */

    const article = document.createElement('article');
    article.className = 'job-list-card position-relative';

    const logo = document.createElement('img');
    logo.className = 'company-logo';
    logo.alt = job.company;
    logo.src = job.company_logo;
    article.append(logo);

    const card = document.createElement('div');
    card.className = 'card clickable';
    article.append(card);

    const inner = document.createElement('div');
    inner.className = 'd-flex flex-column inner';
    card.append(inner);

    const h3 = document.createElement('h3');
    h3.className = 'text-black order-2';
    h3.innerHTML = job.title;
    inner.append(h3);

    const type = document.createElement('p');
    type.className = 'type order-1';
    inner.append(type);

    const createdAt = job.created_at;
    const time = document.createElement('time');
    time.dateTime = createdAt;
    const elapsedTime = getElapsedTime(createdAt);
    time.innerHTML = elapsedTime;
    type.append(time);

    const span = document.createElement('span');
    span.innerHTML = job.type;
    type.append(span);

    const company = document.createElement('p');
    company.className = 'order-3';
    company.innerHTML = job.company;
    inner.append(company);

    const location = document.createElement('p');
    location.className = 'text-light order-4 location';
    location.innerHTML = job.location;
    inner.append(location);

    card.addEventListener('click', (evt) => {
      showDetails(job, elapsedTime, evt);
    });

    return article;
  }

  function showDetails(job, elapsedTime, evt) {

  }

  function showError(err) {
    console.log(err);
  }

  function getElapsedTime(date) {
    let elapsed = (Date.now() - Date.parse(date)) / 1000;
    if(elapsed < 60) {
      return `${Math.floor(elapsed)}s ago`
    }
    elapsed = elapsed / 60;
    if(elapsed < 60) {
      return `${Math.floor(elapsed)}m ago`
    }
    elapsed = elapsed / 60;
    if(elapsed < 24) {
      return `${Math.floor(elapsed)}h ago`
    }
    let days = elapsed / 25;
    if(days < 7) {
      return `${Math.floor(days)}d ago`
    }
    if(days < 28) {
      return `${Math.floor(days / 7)}w ago`
    }
    let months = days / 365;
    if(months < 12) {
      return `${Math.floor(months)}mo ago`
    }
    return `${Math.floor(months / 12)}y ago`;
  }

  window.addEventListener('load', main);
})();
