// Uncomment these imports to begin using these cool features!
// import {inject} from '@loopback/core';
import {response, request} from 'express';
import {post} from '@loopback/rest';
import {resolverBook} from 'nodejs-book-modules';

export class BookController {
  @post('/api/books')
  async books(): Promise<any> {
    return resolverBook.books(request, response);
  }
}
