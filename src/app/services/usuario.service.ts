import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Usuario } from '../model/Usuario';

@Injectable()
export class UsuarioService {

  private usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuario$: Observable<Usuario[]>;

  constructor(private angularFirestore: AngularFirestore) {
    this.usuarioCollection = this.angularFirestore.collection<Usuario>("usuario");
  }

  getUsuarios(): Observable<any[]> {
    let resultados: any[] = [];
    let meuObservable = new Observable<any[]>(observer => {
      this.usuarioCollection.snapshotChanges().subscribe(result => {
        result.map(documents => {
          let id = documents.payload.doc.id;
          let data = documents.payload.doc.data() as Usuario
          let document = { id: id, ...data };
          resultados.push(document);
        });
        observer.next(resultados);
        observer.complete();
      });
    });
    return meuObservable;
  }

  salvar(usuario: Usuario) {
    this.usuarioCollection.add(usuario).then(
      resultado => {
        usuario.id = resultado.id;
      });
  }
  atualizarUsuario(usuario: Usuario) {
    this.usuarioCollection.doc(usuario.id).update({ /*colocar um boolean pra dizer se o usuario foi
    "preenchido corretamente" */});
  }

  deletarUsuario(usuario: Usuario) {
    this.usuarioCollection.doc(usuario.id).delete();
  }
  
}