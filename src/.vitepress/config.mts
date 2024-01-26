import {DefaultTheme, defineConfig} from 'vitepress'

// Will be displayed in left side bar and navigation
const links = [
  { text: 'Introduction', link: '/introduction' },
  { text: 'Projects', items: [

    { text: 'Rust', items: [
      { text: 'Rustlings', link: '/projects/rust/rustlings'}, 
      { text: 'Rust todo list', link: '/projects/rust/rust-todo'},
      //{ text: 'TODO', link: '/projects/rust/TODO'}, 
    ]},

    { text: 'Java', items: [
      { text: 'Ex Java', link: '/projects/java/ex-java'}, 
      { text: 'Tick Tack Toe', link: '/projects/java/tick-tack-toe'},
      //{ text: 'TODO', link: '/projects/java/TODO'}, 
    ]},
    
    { text: 'Javascript', items: [
      { text: 'Ex Javascript', link: '/projects/js/ex-js'},
      { text: 'Js Grade Calculator', link: '/projects/js/grade-calculator'},
      //{ text: 'TODO', link: '/projects/js/TODO'}, 
    ]},
    
    { text: 'Html-Css', items: [
      { text: 'Static Website', link: '/projects/html-css/static-web'},
      { text: 'Web Integration', link: '/projects/html-css/web-integration'},
      //{ text: 'TODO', link: '/projects/html-css/TODO'}, 
    ]}

  ]}
]

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // Update your title and description with user name
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
