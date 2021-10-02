(function($){'use strict';var like={};mkd.modules.like=like;like.mkdLikes=mkdLikes;like.mkdOnDocumentReady=mkdOnDocumentReady;like.mkdOnWindowLoad=mkdOnWindowLoad;like.mkdOnWindowResize=mkdOnWindowResize;like.mkdOnWindowScroll=mkdOnWindowScroll;$(document).ready(mkdOnDocumentReady);$(window).on('load',mkdOnWindowLoad);$(window).resize(mkdOnWindowResize);$(window).scroll(mkdOnWindowScroll);function mkdOnDocumentReady(){mkdLikes();}
function mkdOnWindowLoad(){}
function mkdOnWindowResize(){}
function mkdOnWindowScroll(){}
function mkdLikes(){$(document).on('click','.mkd-like',function(){var likeLink=$(this),id=likeLink.attr('id'),type;if(likeLink.hasClass('liked')){return false;}
if(typeof likeLink.data('type')!=='undefined'){type=likeLink.data('type');}
var dataToPass={action:'fleur_mikado_like',likes_id:id,type:type};var like=$.post(mkdLike.ajaxurl,dataToPass,function(data){likeLink.html(data).addClass('liked').attr('title','You already like this!');if(type!=='portfolio_list'){likeLink.children('span').css('opacity',1);}});return false;});}})(jQuery);