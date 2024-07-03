import {defineConfig} from 'vitepress'

// Will be displayed in left sidebar and navigation
const links = [
  { text: 'Introduction', link: '/introduction' },
  { text: 'Projects', items: [

    { text: 'Rust', items: [
      { link: '/projects/rust/rustlings', text: 'Rustlings' },
      { link: '/projects/rust/rust-todo', text: 'Rust todo list' },
      { link: '/projects/rust/sw', text: 'Solution Wiper' },
      //{ link: '/projects/rust/TODO', text: 'TODO' },
    ]},

    { text: 'Java', items: [
      { link: '/projects/java/ex-java', text: 'Ex Java' },
      { link: '/projects/java/tic-tac-toe', text: 'Tic Tic Toe' },
      { link: '/projects/java/time-tracking-analysis', text: 'Time Tracking Analysis' },
      //{ link: '/projects/java/TODO', text: 'TODO' },
    ]},

    { text: 'Javascript', items: [
      { link: '/projects/js/ex-js', text: 'Ex Javascript' },
      { link: '/projects/js/grade-calculator', text: 'Js Grade Calculator' },
      //{ link: '/projects/js/TODO', text: 'TODO' },
    ]},

    { text: 'php', items: [
      { link: '/projects/php/php-todo', text: 'Php Todo List' },
      { link: '/projects/php/blog', text: 'Slim + Twig Blog' },
      //{ link: '/projects/php/TODO', text: 'TODO' },
    ]},

    { text: 'Html-Css', items: [
      { link: '/projects/html-css/static-web', text: 'Static Website' },
      { link: '/projects/html-css/web-integration', text: 'Web Integration' },
      //{ link: '/projects/html-css/TODO', text: 'TODO' },
    ]},

    { text: 'Others', items: [
        { link: '/projects/others/climat-guardian', text: 'Climat Guardian' },
        //{ link: '/projects/others/TODO', text: 'TODO' },
    ]}

  ]}
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // Update your title and description with username
  title: "My Progress Report - Toto",
  description: "The training report outlines all the skills acquired during the CFC of computer scientist applications development.",
  cleanUrls: true,
  lang: 'en',
  base: "/RapportFormation/",
  lastUpdated: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      // @ts-ignore
      ...links
    ],

    outline: [2,3],
    sidebar: links,

    search: {
      provider: 'local',
    },

    socialLinks: [
      // Replace link with yor own GitHub repo or github profile
      { icon: 'github', link: 'https://github.com/Rignchen' }
    ],

    editLink: {
      // Change first part of path to your repo name
      pattern: 'https://github.com/Rignchen/RapportFormation/edit/main/src/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
