import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '../../../node_modules/angularfire2/firestore';
import { UsuarioCadastro } from '../model/UsuarioCadastro';
import { Usuario } from '../model/Usuario';
import { NotifyService } from './notify.service';
import { switchMap } from '../../../node_modules/rxjs/operators';
import { of } from '../../../node_modules/rxjs/observable/of';


@Injectable()
export class AuthService {
	private user: Observable<firebase.User>;
	private usuarioCollection: AngularFirestoreCollection<Usuario>;
	private userDetails: firebase.User = null;

	constructor(private firebaseAuth: AngularFireAuth, private angularfire: AngularFirestore,
		private router: Router, private notify: NotifyService) {
		this.usuarioCollection = this.angularfire.collection("usuario");
		this.user = this.firebaseAuth.authState.pipe(
			switchMap(user => {
				if (user) {
					return this.angularfire.doc<UsuarioCadastro>(`users/${user.uid}`).valueChanges();
				} else {
					return of(null);
				}
			})
		);
	}
	
	emailSignUp(email: string, password: string) {
		return this.firebaseAuth.auth
		.createUserWithEmailAndPassword(email, password)
		.then(credential => {
			this.notify.update('Seja bem-vindo!', 'success');
			return this.updateUserData(credential.user); // if using firestore
			})
			.catch(error => this.handleError(error));
	}

	emailLogin(email: string, password: string) {
		return this.firebaseAuth.auth
		.signInWithEmailAndPassword(email, password)
			.then(credential => {
				this.notify.update('Bem-vindo de volta!', 'success');
				return this.updateUserData(credential.user);
			})
			.catch(error => this.handleError(error));
	}
	
	signInWithGoogle() {
		return this.firebaseAuth.auth.signInWithPopup(
			new firebase.auth.GoogleAuthProvider()
		)
	}	
	
	private updateUserData(user: UsuarioCadastro) {
		const userRef: AngularFirestoreDocument<UsuarioCadastro> = this.angularfire.doc(
			`users/${user.id}`
		);
	}
	private handleError(error: Error) {
		console.error(error);
		this.notify.update(error.message, 'error');
	}

	logout() {
		this.firebaseAuth.auth.signOut()
			.then((res) => this.router.navigate(['/']));
	}
	isLoggedIn() {
		if (this.userDetails == null) {
			return false;
		} else {
			return true;
		}
	}
}