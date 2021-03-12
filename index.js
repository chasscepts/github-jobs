(function iife() {
  function showError(err) {
    console.log(err);
  }

  function getElapsedTime(date) {
    let elapsed = (Date.now() - Date.parse(date)) / 1000;
    if (elapsed < 60) {
      return `${Math.floor(elapsed)}s ago`;
    }
    elapsed /= 60;
    if (elapsed < 60) {
      return `${Math.floor(elapsed)}m ago`;
    }
    elapsed /= 60;
    if (elapsed < 24) {
      return `${Math.floor(elapsed)}h ago`;
    }
    const days = elapsed / 25;
    if (days < 7) {
      return `${Math.floor(days)}d ago`;
    }
    if (days < 28) {
      return `${Math.floor(days / 7)}w ago`;
    }
    const months = days / 365;
    if (months < 12) {
      return `${Math.floor(months)}mo ago`;
    }
    return `${Math.floor(months / 12)}y ago`;
  }

  function showDetails(job) {
    document.querySelector('#footer-title').innerHTML = job.title;
    document.querySelector('#footer-company').innerHTML = job.company;
    document.querySelector('#details-header-company').innerHTML = job.company;
    document.querySelector('#details-header-logo').src = job.company_logo;
    document.querySelector('#details-header-site').href = job.company_url;
    document.querySelector('#details-how-to-apply').innerHTML = job.how_to_apply;
    document.querySelector('#details-elapsed').innerHTML = job.age;
    document.querySelector('#details-type').innerHTML = job.type;
    document.querySelector('#details-title').innerHTML = job.title;
    document.querySelector('#details-location').innerHTML = job.location;
    document.querySelector('#details-body').innerHTML = job.description;

    if (!(job.hostname)) {
      try {
        const url = new URL(job.company_url);
        job.hostname = url.hostname;
      } catch (err) {
        job.hostname = 'unknown';
      }
    }
    document.querySelector('#details-header-url').innerHTML = job.hostname;

    document.body.classList.add('details');
  }

  function createJobListArticles(job) {
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
    h3.className = 'theme-text-dark order-2';
    h3.innerHTML = job.title;
    inner.append(h3);

    const type = document.createElement('p');
    type.className = 'type order-1';
    inner.append(type);

    const createdAt = job.created_at;
    const time = document.createElement('time');
    time.dateTime = createdAt;
    if (!job.age) {
      job.age = getElapsedTime(createdAt);
    }
    time.innerHTML = job.age;
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
      showDetails(job, evt);
    });

    return article;
  }

  function setupthemes() {
    const btn = document.querySelector('#theme-check');
    btn.addEventListener('change', () => {
      document.body.classList.toggle('dark');
    });
  }

  function setupLoading() {
    let store = [];
    let pointer = 0;
    let page = 0;
    const baseUrl = 'https://arcane-temple-01740.herokuapp.com/https://jobs.github.com/positions.json';
    const UNIT = 12;
    const articlesWrap = document.querySelector('#articles-wrap');
    const loadingWrap = document.querySelector('#loading-wrap');
    const searchForm = document.querySelector('#search-form');

    let description = '';
    let fulltime = false;
    let location = '';

    const queryParams = () => {
      const arr = [];
      if (page) {
        arr.push(`page=${page}`);
      }
      if (description) {
        arr.push(`description=${description}`);
      }
      if (location) {
        arr.push(`location=${location}`);
      }
      if (fulltime) {
        arr.push('full_time=true');
      }
      if (arr.length <= 0) return '';
      return `?${arr.join('&')}`;
    };

    const addArticlesToDom = () => {
      const max = Math.min(pointer + UNIT, store.length);
      while (pointer < max) {
        articlesWrap.append(createJobListArticles(store[pointer]));
        pointer += 1;
      }
    };

    const fetchNextPage = () => new Promise((resolve, reject) => {
      const url = baseUrl + queryParams();
      const xhr = new XMLHttpRequest();
      xhr.open('get', url);
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const arr = JSON.parse(xhr.response);
            store = [...store, ...arr];
            resolve();
          } catch (err) {
            reject(err);
          }
        } else {
          reject(xhr.response);
        }
      };

      xhr.send();
    });

    const load = () => {
      if (pointer + UNIT < store.length) {
        addArticlesToDom();
        return;
      }

      loadingWrap.classList.add('loading');
      fetchNextPage()
        .then(() => {
          addArticlesToDom();
          loadingWrap.classList.remove('loading');
        })
        .catch(err => {
          showError(err);
          loadingWrap.classList.remove('loading');
        });
    };

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

    document.querySelector('#more-jobs').addEventListener('click', load);

    document.querySelector('#back-btn').addEventListener('click', () => {
      document.body.classList.remove('details');
    });
  }

  function main() {
    setupLoading();
    setupthemes();
  }

  window.addEventListener('load', main);
}());
